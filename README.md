# YouTube SEO Optimizer

An AI-powered tool that helps content creators optimize their YouTube videos for better SEO performance. Simply paste your video transcript, and the AI generates optimized titles, descriptions, thumbnail text, and tags tailored to your content style.

## Features

### 🤖 AI-Powered Content Generation
- **Video Titles**: Generate 5 SEO-optimized title options that you can edit and customize
- **Thumbnail Titles**: Short, attention-grabbing text perfect for thumbnails
- **Video Descriptions**: SEO-optimized descriptions with natural keyword integration
- **Tags**: Relevant, comma-separated tags for better discoverability

### 📚 Learning System
- **Training Data**: Add examples of your successful content to train the AI
- **History Tracking**: Automatically learns from your saved content preferences
- **Style Consistency**: AI adapts to match your brand voice and formatting style

### 💾 Content Management
- **Save & Organize**: Save all generated content with full transcripts
- **History View**: Browse and review all your past optimized content
- **Editable Fields**: Edit all generated content before saving

## Tech Stack

### Web Application
- **Framework**: React Router v7
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Chakra UI
- **State Management**: Zustand, TanStack Query
- **Database**: Neon (PostgreSQL)
- **AI Integration**: Google Gemini 2.5 Pro
- **Authentication**: Auth.js

### Mobile Application
- **Framework**: Expo / React Native
- **Routing**: Expo Router
- **Platforms**: iOS, Android, Web

## Project Structure

```
apps/
├── web/                 # Web application
│   ├── src/
│   │   ├── app/        # Routes and pages
│   │   │   ├── page.jsx           # Main dashboard
│   │   │   ├── history/           # History page
│   │   │   └── training/          # Training data page
│   │   └── app/api/    # API routes
│   │       ├── generate-content/  # AI content generation
│   │       ├── save-results/      # Save generated content
│   │       ├── history/           # Retrieve saved content
│   │       └── training/           # Training data management
│   └── package.json
└── mobile/             # Mobile application (Expo)
    ├── src/
    └── package.json
```

## Getting Started

### Prerequisites
- Node.js 18+ (or Bun)
- PostgreSQL database (Neon recommended)
- Google Gemini API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/sirakinb/youtube-seo-optimizer.git
cd youtube-seo-optimizer
```

2. Install dependencies for web app:
```bash
cd apps/web
npm install
```

3. Install dependencies for mobile app:
```bash
cd apps/mobile
npm install
```

4. Set up environment variables:
```bash
# Copy .env.example to .env and fill in your values
DATABASE_URL=your_postgresql_connection_string
GOOGLE_GEMINI_API_KEY=your_gemini_api_key
```

5. Run database migrations:
The database schema is automatically created on first API call to `/api/generate-content`.

### Development

Start the web development server:
```bash
cd apps/web
npm run dev
```

Start the mobile development server:
```bash
cd apps/mobile
npm start
```

## Usage

1. **Generate Content**: Paste your video transcript and click "Generate Content"
2. **Review Options**: Browse through 5 AI-generated title options
3. **Edit & Customize**: Edit any generated content to match your preferences
4. **Save Results**: Save your optimized content for future reference
5. **Train the AI**: Add examples of your successful content to improve future generations
6. **View History**: Access all your saved content anytime

## API Endpoints

### `POST /api/generate-content`
Generates SEO-optimized content from a video transcript.

**Request:**
```json
{
  "transcript": "Your video transcript text..."
}
```

**Response:**
```json
{
  "id": 1,
  "description": "SEO-optimized description...",
  "thumbnail_title": "Short thumbnail text",
  "video_title_options": ["Title 1", "Title 2", "Title 3", "Title 4", "Title 5"],
  "tags": "tag1, tag2, tag3",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### `POST /api/save-results`
Saves the final edited content to the database.

### `GET /api/history`
Retrieves all saved content results.

### `GET /api/training`
Retrieves training examples.

### `POST /api/training`
Adds a new training example.

### `DELETE /api/training?id={id}`
Deletes a training example.

## Database Schema

The application uses three main tables:

- **generations**: Stores all AI-generated content
- **saved_results**: Stores final edited content chosen by users
- **training_examples**: Stores user-provided examples for AI learning

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Powered by Google Gemini 2.5 Pro
- Built with React Router and Expo
- Database hosted on Neon
