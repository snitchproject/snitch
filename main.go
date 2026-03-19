package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
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
	Score      int      `json:"score"`
	Summary    string   `json:"summary"`
	Categories []string `json:"categories"`
}

type ErrorResponse struct {
	Error string `json:"error"`
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

	prompt := fmt.Sprintf("Analyze privacy for \"%s\". Return JSON: {\"score\":1-10 (10=best privacy, 1=worst),\"summary\":\"brief explanation\",\"categories\":[\"data types\"]}", req.App)

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
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(result)
}

func main() {
	http.HandleFunc("/analyze", handleAnalyze)

	port := "8080"
	log.Printf("Snitch backend running on port %s", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal(err)
	}
}
