# Setup Instructions

## Prerequisites

- Node.js v14 or higher
- npm or yarn
- A modern web browser with webcam support

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/AhmadZalouhk/face_website.git
cd face_website
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start the server
npm start
# or for development with auto-reload
npm run dev
```

The backend will run on `http://localhost:3000`

### 3. Frontend Setup (in another terminal)

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local

# Start development server
npm run dev
```

The frontend will run on `http://localhost:5173`

### 4. Access the Application

Open your browser and navigate to `http://localhost:5173`

## Features

### Real-time Webcam Detection
1. Click on the "Webcam" tab
2. Allow camera permissions when prompted
3. Click "Start Detection" to begin face detection
4. The app will display:
   - Bounding boxes around detected faces
   - Confidence scores
   - Detected emotions
   - FPS and detection time

### Image Upload Detection
1. Click on the "Upload Image" tab
2. Drag and drop an image or click to select
3. Click "Detect Faces" to process
4. View results with:
   - Detected faces count
   - Face positions and sizes
   - Emotion analysis

## API Endpoints

### Backend API

**Detect Faces in Image**
- **Endpoint**: `POST /api/face/detect-image`
- **Content-Type**: `multipart/form-data`
- **Body**: `image` (file)

**Check Models Status**
- **Endpoint**: `GET /api/face/models`

**Delete Image**
- **Endpoint**: `DELETE /api/face/image/:fileName`

## Building for Production

### Frontend Build

```bash
cd frontend
npm run build
```

## Supported Image Formats

- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)
- Maximum file size: 10MB

## License

MIT License
