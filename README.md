# EchoLoom

A complete meeting app with Google authentication, video calls, chat functionality, and real-time updates.

## Features

- Google authentication
- Meeting scheduling
- Email invites
- Participant forms
- Meeting history
- Video calls with volume control
- Chat functionality
- Real-time updates with MongoDB Change Streams

## Tech Stack

- **Frontend**: Next.js (App Router)
- **Backend**: Next.js API Routes
- **Database**: MongoDB (Atlas)
- **Video**: Daily.co
- **Auth**: NextAuth (Google)
- **Emails**: Resend
- **Real-time**: MongoDB Change Streams
- **Styling**: TailwindCSS

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Create a `.env.local` file with the required environment variables (see `.env.example`)
4. Run the development server:
   ```bash
   pnpm dev
   ```

## API Routes

### Authentication

- `/api/auth/[...nextauth]` - NextAuth authentication routes

### Meetings

- `POST /api/meetings` - Create a new meeting
- `GET /api/meetings` - Get user's meetings
- `GET /api/meetings/[id]` - Get meeting details
- `PUT /api/meetings/[id]` - Update meeting
- `DELETE /api/meetings/[id]` - Delete meeting

### Participants

- `GET /api/meetings/[id]/participants` - Get meeting participants
- `POST /api/meetings/[id]/participants` - Add participants
- `DELETE /api/meetings/[id]/participants` - Remove participant

### Invites

- `POST /api/meetings/[id]/invite` - Send meeting invitations

### Join Meeting

- `POST /api/meetings/[id]/join` - Join meeting with video settings

### Chat

- `GET /api/meetings/[id]/chat` - Get chat messages
- `POST /api/meetings/[id]/chat` - Send chat message

### Forms

- `GET /api/meetings/[id]/forms` - Get form submissions
- `POST /api/meetings/[id]/forms` - Submit form responses

## Environment Variables

- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `MONGODB_URI` - MongoDB connection URI
- `NEXTAUTH_URL` - NextAuth URL (e.g., http://localhost:3000)
- `NEXTAUTH_SECRET` - NextAuth secret for JWT encryption
- `DAILY_API_KEY` - Daily.co API key
- `DAILY_SUBDOMAIN` - Daily.co subdomain
- `RESEND_API_KEY` - Resend API key for sending emails
