<template>
  <div class="image-uploader">
    <div class="upload-area" @dragover="isDragging = true" @dragleave="isDragging = false" @drop="handleDrop">
      <input 
        ref="fileInput"
        type="file" 
        accept="image/*" 
        @change="handleFileSelect"
        style="display: none"
      />
      <div :class="['drag-drop', { dragging: isDragging }]" @click="$refs.fileInput.click()">
        <p>📁 Drag and drop an image here or click to select</p>
        <p class="sub-text">Supported: JPEG, PNG, GIF, WebP (Max 10MB)</p>
      </div>
    </div>

    <div v-if="selectedFile" class="file-info">
      <p>Selected: <strong>{{ selectedFile.name }}</strong></p>
      <p>Size: <strong>{{ (selectedFile.size / 1024).toFixed(2) }}KB</strong></p>
    </div>

    <div class="controls">
      <button @click="uploadImage" :disabled="!selectedFile || isLoading" class="btn btn-primary">
        {{ isLoading ? '⏳ Processing...' : '🚀 Detect Faces' }}
      </button>
      <button v-if="selectedFile" @click="clearFile" class="btn btn-secondary">
        🗑️ Clear
      </button>
    </div>

    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <p>Processing image...</p>
    </div>

    <FaceDisplay v-if="detections" :detections="detections" :imagePath="imagePath" />

    <div v-if="errorMessage" class="error">
      ❌ {{ errorMessage }}
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import axios from 'axios'
import FaceDisplay from './FaceDisplay.vue'

export default {
  name: 'ImageUploader',
  components: {
    FaceDisplay
  },
  setup() {
    const fileInput = ref(null)
    const selectedFile = ref(null)
    const isDragging = ref(false)
    const isLoading = ref(false)
    const detections = ref(null)
    const imagePath = ref('')
    const errorMessage = ref('')

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

    const handleFileSelect = (event) => {
      const file = event.target.files[0]
      if (file) {
        selectedFile.value = file
        errorMessage.value = ''
      }
    }

    const handleDrop = (event) => {
      event.preventDefault()
      isDragging.value = false
      const file = event.dataTransfer.files[0]
      if (file && file.type.startsWith('image/')) {
        selectedFile.value = file
        errorMessage.value = ''
      } else {
        errorMessage.value = 'Please drop an image file'
      }
    }

    const uploadImage = async () => {
      if (!selectedFile.value) return

      isLoading.value = true
      errorMessage.value = ''
      detections.value = null

      try {
        const formData = new FormData()
        formData.append('image', selectedFile.value)

        const response = await axios.post(`${API_URL}/api/face/detect-image`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        detections.value = response.data.detections
        imagePath.value = `${API_URL}${response.data.filePath}`
      } catch (error) {
        console.error('Upload error:', error)
        errorMessage.value = error.response?.data?.error || 'Failed to process image'
      } finally {
        isLoading.value = false
      }
    }

    const clearFile = () => {
      selectedFile.value = null
      detections.value = null
      imagePath.value = ''
      if (fileInput.value) {
        fileInput.value.value = ''
      }
    }

    return {
      fileInput,
      selectedFile,
      isDragging,
      isLoading,
      detections,
      imagePath,
      errorMessage,
      handleFileSelect,
      handleDrop,
      uploadImage,
      clearFile
    }
  }
}
</script>

<style scoped>
.image-uploader {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.upload-area {
  margin-bottom: 2rem;
}

.drag-drop {
  border: 3px dashed #667eea;
  border-radius: 8px;
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f9f9f9;
}

.drag-drop:hover {
  background: #f0f0f0;
  border-color: #764ba2;
}

.drag-drop.dragging {
  background: #e8e8ff;
  border-color: #764ba2;
  transform: scale(1.02);
}

.drag-drop p {
  margin: 0;
  color: #333;
  font-size: 1.1rem;
  font-weight: 600;
}

.sub-text {
  font-size: 0.9rem !important;
  color: #999 !important;
  font-weight: normal !important;
  margin-top: 0.5rem !important;
}

.file-info {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.file-info p {
  margin: 0.25rem 0;
  color: #666;
}

.controls {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5568d3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-secondary {
  background: #ddd;
  color: #333;
}

.btn-secondary:hover {
  background: #ccc;
  transform: translateY(-2px);
}

.loading {
  text-align: center;
  padding: 2rem;
  margin: 2rem 0;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  background: #fee;
  color: #c00;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #c00;
}

@media (max-width: 768px) {
  .image-uploader {
    padding: 1rem;
  }

  .drag-drop {
    padding: 2rem 1rem;
  }

  .controls {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
