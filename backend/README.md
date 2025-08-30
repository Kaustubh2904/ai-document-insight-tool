# AI Document Insight Tool - Backend

## Setup Instructions

1. **Create Virtual Environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your database and API keys
   ```

4. **Database Setup**
   ```bash
   # Create database (PostgreSQL)
   createdb document_insight
   
   # Run migrations (if using Alembic)
   alembic upgrade head
   ```

5. **Run the Application**
   ```bash
   uvicorn app.main:app --reload
   ```

## API Endpoints

- **Authentication**
  - POST `/api/v1/auth/register` - User registration
  - POST `/api/v1/auth/login` - User login
  - GET `/api/v1/auth/profile` - Get user profile

- **Documents**
  - POST `/api/v1/documents/upload` - Upload document
  - GET `/api/v1/documents` - List user documents
  - GET `/api/v1/documents/{id}` - Get specific document
  - DELETE `/api/v1/documents/{id}` - Delete document

- **Processing**
  - POST `/api/v1/process/{id}` - Process document with AI
  - GET `/api/v1/process/{id}/status` - Get processing status
  - GET `/api/v1/process/{id}/insights` - Get document insights

## Testing

```bash
pytest
```
