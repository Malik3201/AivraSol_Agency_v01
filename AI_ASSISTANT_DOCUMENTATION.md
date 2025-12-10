# AI Assistant (Aiva) - Implementation Documentation

## Overview
The AI assistant "Aiva" has been completely redesigned to provide secure, dynamic, and accurate responses about the AivraSol agency website. All AI processing now happens securely on the backend, with the frontend acting as a simple interface.

## Architecture

### Backend Implementation (`backend/routes/aiva.js`)

**Key Features:**
- ✅ Secure API key management (never exposed to frontend)
- ✅ Dynamic data fetching from MongoDB
- ✅ Comprehensive context building from live website data
- ✅ LongCat API integration (OpenAI-compatible)
- ✅ Robust error handling and fallback responses

**Endpoint:** `POST /aiva/chat`

**Request Format:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "What services do you offer?"
    }
  ]
}
```

**Response Format:**
```json
{
  "success": true,
  "content": "AI-generated response here...",
  "timestamp": "2025-12-10T14:00:00.000Z"
}
```

**Data Sources (fetched from MongoDB):**
1. **Projects** - Portfolio showcase with technologies and descriptions
2. **Services** - All service offerings with details
3. **Tech Stack** - Technologies organized by category
4. **FAQs** - Frequently asked questions and answers
5. **Testimonials** - Client feedback and ratings

**AI Configuration:**
- API: `https://api.longcat.chat/openai/v1/chat/completions`
- Model: `gpt-3.5-turbo`
- Temperature: `0.7`
- Max Tokens: `800`

### Frontend Implementation (`frontend/src/components/aiva/Aiva.tsx`)

**Key Features:**
- ✅ Clean, simple implementation
- ✅ No exposed API keys or sensitive data
- ✅ Beautiful, animated UI with markdown support
- ✅ Automatic scrolling and focus management
- ✅ Professional error handling

**Changes Made:**
1. Removed direct Gemini API calls
2. Removed exposed API key
3. Removed client-side data fetching
4. Removed complex context building logic
5. Added simple backend API integration
6. Uses centralized `API_BASE` configuration

## Configuration

### Development Setup

1. **Backend** (already configured):
   - MongoDB connection required
   - LongCat API key securely stored in backend code
   - Runs on `http://localhost:4000`

2. **Frontend**:
   - Vite proxy configured for `/aiva` endpoint
   - Uses `API_BASE` from `@/lib/config`
   - Runs on `http://localhost:5173`

### Production Setup

**Frontend Environment Variables:**
```bash
VITE_API_BASE=https://your-backend-domain.com
```

**Backend Environment Variables:**
```bash
MONGODB_URL=your_mongodb_connection_string
PORT=4000
```

## How It Works

1. **User Opens Chat**: Frontend displays greeting message
2. **User Sends Message**: Frontend sends message history to backend
3. **Backend Processing**:
   - Fetches latest data from MongoDB
   - Builds comprehensive system context
   - Calls LongCat AI API
   - Returns formatted response
4. **Frontend Display**: Shows AI response with markdown formatting

## System Prompt

The AI assistant is guided by a comprehensive system prompt that includes:
- Company overview and mission
- Complete service list with descriptions
- Portfolio projects with technologies
- Tech stack organized by category
- FAQs for common questions
- Client testimonials
- Response guidelines and personality traits

## Response Quality

**Aiva is designed to:**
- ✅ Provide accurate information based on real website data
- ✅ Never fabricate or invent information
- ✅ Be conversational and professional
- ✅ Always provide helpful next steps
- ✅ Redirect off-topic questions gracefully
- ✅ Handle errors with user-friendly messages

## Security Improvements

**Before:**
- ❌ API key exposed in frontend code
- ❌ Direct API calls from client
- ❌ Client-side rate limiting required
- ❌ Vulnerable to API key theft

**After:**
- ✅ API key secured on backend
- ✅ All AI calls through backend
- ✅ Centralized rate limiting
- ✅ No sensitive data exposure

## Testing

### Manual Testing Steps:

1. **Open the website**: `http://localhost:5173`
2. **Click the Aiva button** (bottom-right corner)
3. **Test various queries**:
   - "What services do you offer?"
   - "Show me your projects"
   - "What technologies do you use?"
   - "I need a website for my business"
   - "How can I contact you?"

### Expected Behavior:
- Responses should be accurate and based on database content
- Responses should be well-formatted with markdown
- Error messages should be user-friendly
- Chat should auto-scroll and maintain focus

## API Endpoints

### Main Chat Endpoint
```
POST /aiva/chat
Content-Type: application/json

Body:
{
  "messages": Array<{ role: "user" | "assistant", content: string }>
}

Response:
{
  "success": boolean,
  "content": string,
  "timestamp": string,
  "error"?: string  // only on error
}
```

### Health Check
```
GET /aiva/health

Response:
{
  "success": true,
  "service": "Aiva AI Assistant",
  "status": "operational",
  "timestamp": string
}
```

## Maintenance

### Updating System Context
To modify how Aiva responds, edit the `buildSystemContext()` function in `backend/routes/aiva.js`.

### Adding New Data Sources
1. Import the model: `import { YourModel } from "../models/yourModel.js"`
2. Add to `fetchWebsiteData()` function
3. Format in `buildSystemContext()` function

### Adjusting AI Behavior
Modify these parameters in the LongCat API call:
- `temperature`: 0.1-1.0 (lower = more focused, higher = more creative)
- `max_tokens`: Response length limit
- `model`: AI model selection

## Troubleshooting

### Frontend not connecting to backend
- Check `VITE_API_BASE` environment variable
- Verify Vite proxy is configured
- Ensure backend is running on correct port

### Backend errors
- Check MongoDB connection
- Verify LongCat API key is valid
- Check network connectivity

### AI responses are inaccurate
- Verify MongoDB data is up-to-date
- Check `buildSystemContext()` function
- Review system prompt clarity

## Future Enhancements

Potential improvements:
- [ ] Add conversation persistence
- [ ] Implement user authentication for personalized responses
- [ ] Add analytics tracking for common questions
- [ ] Implement streaming responses for better UX
- [ ] Add multi-language support
- [ ] Cache frequently asked questions

## Support

For issues or questions:
1. Check MongoDB data is populated
2. Verify all environment variables are set
3. Check backend logs for errors
4. Test backend endpoint directly using Postman/curl

---

**Last Updated:** December 10, 2025  
**Version:** 2.0.0  
**Status:** ✅ Production Ready

