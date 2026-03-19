# Snitch

A privacy rating web app that analyzes apps and tells you what data they collect in plain English.

## Features

- Privacy scores (1-10) for any app
- Plain English explanations of data collection
- Data categories grouped by risk level
- Search history and autocomplete
- Dark/light mode
- Mobile responsive
- Free and open source

## Setup

### Backend

1. Set your Navy AI API key:
```bash
export NAVYAI_API_KEY=your_actual_key_here
```

2. Run the Go server:
```bash
go run main.go
```

Server runs on port 8080.

### Frontend

1. Install dependencies:
```bash
npm install
```

2. (Optional) Create a `.env` file if your backend runs on a different URL:
```bash
VITE_API_URL=http://localhost:8080
```

3. Run the dev server:
```bash
npm run dev
```

## How it works

1. User types an app name and hits search
2. Frontend sends `POST /analyze` to the Go backend
3. Backend calls Navy AI to analyze the app's privacy practices
4. Results display with a score (1-10), plain English summary, and data categories grouped by risk

## API

### POST /analyze

**Request:**
```json
{
  "app": "TikTok"
}
```

**Response:**
```json
{
  "score": 2,
  "summary": "TikTok collects extensive user data...",
  "categories": ["Location", "Contacts", "Browsing History"]
}
```

**Example curl:**
```bash
curl -X POST http://localhost:8080/analyze \
  -H "Content-Type: application/json" \
  -d '{"app": "TikTok"}'
```

## Tech Stack

- Frontend: React + Vite
- Backend: Go (standard library only)
- AI: Navy AI (gpt-5.2)
- Styling: CSS variables for theming
- Font: Space Grotesk

## License

AGPL-3.0 - See LICENSE file for details

## Support

If you find Snitch useful, consider supporting development with crypto donations. See the Support section in the app.
# snitch
