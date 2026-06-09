# Face Recognition Website

A full-stack application with Vue 3 frontend and Node.js backend for real-time face detection and image-based face recognition using AI.

## Features

- **Real-time webcam face detection** with bounding boxes
- **Upload images** for face recognition
- Display detected faces with labels
- Emotion detection
- Multiple face tracking
- No external APIs required - all processing local

## Technologies

- **Frontend**: Vue 3 + Vite
- **Backend**: Node.js + Express
- **AI Model**: face-api.js (TensorFlow.js-based)
- **Image Processing**: sharp

## Getting Started

### Prerequisites
- Node.js (v14+)
- npm or yarn

### Quick Start

#### Backend
```bash
cd backend
npm install
npm start
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

Then open `http://localhost:5173` in your browser.

## Project Structure

```
face_website/
├── backend/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── uploads/
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── assets/
│   │   ├── App.vue
│   │   └── main.js
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## API Endpoints

- `POST /api/face/detect-image` - Detect faces in uploaded image
- `GET /api/face/models` - Check if models are loaded
- `DELETE /api/face/image/:fileName` - Delete uploaded image

## License

MIT
