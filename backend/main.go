package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"
)

type AnalyzeRequest struct {
	App string `json:"app"`
}

type NavyAIRequest struct {
	Model          string         `json:"model"`
	Messages       []Message      `json:"messages"`
	MaxTokens      int            `json:"max_tokens"`
	ResponseFormat ResponseFormat `json:"response_format"`
}

type ResponseFormat struct {
	Type string `json:"type"`
}

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type NavyAIResponse struct {
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
}

type AnalysisResult struct {
	Score        int      `json:"score"`
	Summary      string   `json:"summary"`
	Categories   []string `json:"categories"`
	Alternatives []string `json:"alternatives,omitempty"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}

// Rate limiter
type RateLimiter struct {
	visitors map[string]*Visitor
	mu       sync.RWMutex
}

type Visitor struct {
	lastSeen time.Time
	count    int
}

var limiter = &RateLimiter{
	visitors: make(map[string]*Visitor),
}

func (rl *RateLimiter) getVisitor(ip string) *Visitor {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	v, exists := rl.visitors[ip]
	if !exists {
		rl.visitors[ip] = &Visitor{lastSeen: time.Now(), count: 0}
		return rl.visitors[ip]
	}

	// Reset count if more than 1 minute has passed
	if time.Since(v.lastSeen) > time.Minute {
		v.count = 0
		v.lastSeen = time.Now()
	}

	return v
}

func (rl *RateLimiter) isAllowed(ip string) bool {
	visitor := rl.getVisitor(ip)
	
	rl.mu.Lock()
	defer rl.mu.Unlock()
	
	if visitor.count >= 10 { // 10 requests per minute
		return false
	}
	
	visitor.count++
	return true
}

// Cleanup old visitors every 5 minutes
func (rl *RateLimiter) cleanup() {
	for {
		time.Sleep(5 * time.Minute)
		rl.mu.Lock()
		for ip, v := range rl.visitors {
			if time.Since(v.lastSeen) > 5*time.Minute {
				delete(rl.visitors, ip)
			}
		}
		rl.mu.Unlock()
	}
}

func getIP(r *http.Request) string {
	// Check X-Forwarded-For header first (for proxies/load balancers)
	forwarded := r.Header.Get("X-Forwarded-For")
	if forwarded != "" {
		ips := strings.Split(forwarded, ",")
		return strings.TrimSpace(ips[0])
	}
	
	// Fall back to RemoteAddr
	ip, _, _ := net.SplitHostPort(r.RemoteAddr)
	return ip
}

func setCORSHeaders(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
}

func handleAnalyze(w http.ResponseWriter, r *http.Request) {
	setCORSHeaders(w)
	log.Printf("Received %s request to /analyze", r.Method)

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != "POST" {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "method not allowed"})
		return
	}

	// Rate limiting
	ip := getIP(r)
	if !limiter.isAllowed(ip) {
		log.Printf("Rate limit exceeded for IP: %s", ip)
		w.WriteHeader(http.StatusTooManyRequests)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "rate limit exceeded, try again later"})
		return
	}

	apiKey := os.Getenv("NAVYAI_API_KEY")
	if apiKey == "" {
		log.Println("ERROR: API key not configured")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "API key not configured"})
		return
	}
	log.Printf("API key found: %s...", apiKey[:10])

	var req AnalyzeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("ERROR: Failed to decode request: %v", err)
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "invalid request"})
		return
	}

	if req.App == "" {
		log.Println("ERROR: App name is empty")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "app name required"})
		return
	}
	log.Printf("Analyzing app: %s", req.App)

	prompt := fmt.Sprintf("Analyze privacy for \"%s\". Return JSON: {\"score\":1-10 (10=best privacy, 1=worst),\"summary\":\"brief explanation\",\"categories\":[\"data types\"],\"alternatives\":[\"2-3 privacy-focused alternative apps\"]}", req.App)

	navyReq := NavyAIRequest{
		Model: "gpt-5.2",
		Messages: []Message{
			{
				Role:    "user",
				Content: prompt,
			},
		},
		MaxTokens: 400,
		ResponseFormat: ResponseFormat{
			Type: "json_object",
		},
	}

	reqBody, err := json.Marshal(navyReq)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "failed to create request"})
		return
	}

	httpReq, err := http.NewRequest("POST", "https://api.navy/v1/chat/completions", bytes.NewBuffer(reqBody))
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "failed to create request"})
		return
	}

	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", "Bearer "+apiKey)

	client := &http.Client{}
	resp, err := client.Do(httpReq)
	if err != nil {
		log.Printf("ERROR: Failed to call Navy AI: %v", err)
		w.WriteHeader(http.StatusBadGateway)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "analysis failed"})
		return
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Printf("ERROR: Failed to read response: %v", err)
		w.WriteHeader(http.StatusBadGateway)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "analysis failed"})
		return
	}

	if resp.StatusCode != http.StatusOK {
		log.Printf("ERROR: Navy AI returned status %d: %s", resp.StatusCode, string(body))
		w.WriteHeader(http.StatusBadGateway)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "analysis failed"})
		return
	}
	log.Printf("Navy AI response: %s", string(body))

	var navyResp NavyAIResponse
	if err := json.Unmarshal(body, &navyResp); err != nil {
		log.Printf("ERROR: Failed to parse Navy AI response: %v", err)
		w.WriteHeader(http.StatusBadGateway)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "analysis failed"})
		return
	}

	if len(navyResp.Choices) == 0 {
		log.Println("ERROR: No choices in Navy AI response")
		w.WriteHeader(http.StatusBadGateway)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "analysis failed"})
		return
	}

	content := strings.TrimSpace(navyResp.Choices[0].Message.Content)
	content = strings.Trim(content, "`")
	content = strings.TrimPrefix(content, "json")
	content = strings.TrimSpace(content)
	log.Printf("AI content: %s", content)

	var result AnalysisResult
	if err := json.Unmarshal([]byte(content), &result); err != nil {
		log.Printf("ERROR: Failed to parse analysis result: %v", err)
		w.WriteHeader(http.StatusBadGateway)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "analysis failed"})
		return
	}

	log.Printf("Successfully analyzed %s with score %d", req.App, result.Score)
	
	// Send Fluxer webhook notification
	go sendFluxerWebhook(req.App, result.Score)
	
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(result)
}

func sendFluxerWebhook(appName string, score int) {
	webhookURL := os.Getenv("FLUXER_WEBHOOK_URL")
	if webhookURL == "" {
		return // Skip if not configured
	}

	payload := map[string]interface{}{
		"content": fmt.Sprintf("🔍 Someone searched for **%s** - Score: %d/10", appName, score),
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return
	}

	http.Post(webhookURL, "application/json", bytes.NewBuffer(jsonData))
}

func main() {
	// Start rate limiter cleanup goroutine
	go limiter.cleanup()

	http.HandleFunc("/analyze", handleAnalyze)

	port := "8080"
	log.Printf("Snitch backend running on port %s", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal(err)
	}
}
