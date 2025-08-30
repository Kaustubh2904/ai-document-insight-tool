# AI Document Insight Tool - Frontend

## Setup Instructions

1. **Serve the Application**
   
   You can serve the frontend using any HTTP server:

   **Option 1: Python HTTP Server**
   ```bash
   cd frontend
   python -m http.server 3000
   ```

   **Option 2: Node.js HTTP Server**
   ```bash
   cd frontend
   npx http-server -p 3000
   ```

   **Option 3: VS Code Live Server**
   - Install Live Server extension
   - Right-click on `index.html`
   - Select "Open with Live Server"

2. **Configuration**
   
   Edit `config.js` to match your backend URL:
   ```javascript
   const CONFIG = {
       API_BASE_URL: 'http://localhost:8000/api/v1'
   };
   ```

## Features

- **Responsive Design** - Works on desktop and mobile
- **File Upload** - Drag & drop or click to upload
- **Real-time Processing** - Live updates during document processing
- **Document Management** - View, process, and delete documents
- **AI Insights** - Summary, key points, entities, and sentiment analysis
- **User Authentication** - Secure login and registration

## File Structure

- `index.html` - Main HTML file
- `assets/css/style.css` - Styles
- `assets/js/` - JavaScript modules
  - `app.js` - Main application logic
  - `auth.js` - Authentication handling
  - `api.js` - API service layer
  - `upload.js` - File upload functionality
  - `documents.js` - Document management
- `config.js` - Configuration settings

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
