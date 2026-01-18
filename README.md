# AI-Powered Document Insight Tool

A full-stack application that leverages AI to extract meaningful insights from documents. Built with HTML/CSS/JavaScript frontend and FastAPI Python backend.

## 🚀 Features

- **Document Upload**: Support for multiple document formats (PDF, DOC, TXT)
- **AI Processing**: Extract key insights, summaries, and metadata from documents
- **User Authentication**: Secure login and registration system
- **Document History**: View and manage previously processed documents
- **Real-time Processing**: Live updates during document processing
- **Modern UI**: Clean, responsive interface built with React and Tailwind CSS

## 🏗️ Project Structure

```
ai-document-insight-tool/
├── backend/                 # FastAPI Python backend
│   ├── app/
│   │   ├── api/v1/          # API routes (auth, documents, processing)
│   │   ├── core/            # Core configuration
│   │   ├── models/          # Database models
│   │   ├── services/        # Business logic & AI service
│   │   └── main.py          # FastAPI app setup
│   ├── uploads/             # File upload directory
│   ├── tests/               # Test files
│   ├── requirements.txt     # Python dependencies
│   └── .env                 # Environment variables
├── frontend/                # HTML/CSS/JavaScript frontend
│   ├── assets/              # Static assets
│   │   ├── css/             # Stylesheets
│   │   ├── js/              # JavaScript files
│   │   └── images/          # Image assets
│   ├── index.html           # Main entry point
│   └── config.js            # Frontend configuration
├── setup.sh                 # Setup script
└── README.md
```

## 🛠️ Tech Stack

### Backend
- **Python** with **FastAPI**
- **SQLAlchemy** - ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Python-multipart** - File upload handling
- **OpenAI API** - AI document processing
- **Pytest** - Testing framework
- **Uvicorn** - ASGI server

### Frontend
- **HTML5** - Markup
- **CSS3** - Styling with modern features
- **Vanilla JavaScript** - Interactive functionality
- **Fetch API** - HTTP requests
- **Local Storage** - Client-side data persistence
- **CSS Grid/Flexbox** - Layout
- **Font Awesome** - Icons

## 🚀 Getting Started

### Prerequisites
- Python 3.8 or higher
- PostgreSQL
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-document-insight-tool
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env with your configuration
   uvicorn app.main:app --reload
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   # Serve with any HTTP server, e.g.:
   python -m http.server 3000
   # Or use Live Server extension in VS Code
   ```

### Environment Variables

Create a `.env` file in the backend directory:

```env
DATABASE_URL=postgresql://username:password@localhost/document_insight
JWT_SECRET_KEY=your-jwt-secret-key
OPENAI_API_KEY=your-openai-api-key
FRONTEND_URL=http://localhost:3000
DEBUG=True
```

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents` - Get user documents
- `GET /api/documents/:id` - Get specific document
- `DELETE /api/documents/:id` - Delete document

### Processing
- `POST /api/process/:id` - Process document with AI
- `GET /api/process/:id/status` - Get processing status

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
# Open frontend/test.html in browser for manual testing
```

## 🚀 Deployment

### Backend Deployment
1. Set up PostgreSQL database
2. Configure environment variables
3. Install dependencies: `pip install -r backend/requirements.txt`
4. Run database migrations
5. Start the server: `uvicorn app.main:app --host 0.0.0.0 --port 8000`

### Frontend Deployment
1. Upload files to any static hosting service (Netlify, Vercel, GitHub Pages)
2. Update `config.js` with production API URL
3. Ensure CORS is configured on the backend for your domain

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

