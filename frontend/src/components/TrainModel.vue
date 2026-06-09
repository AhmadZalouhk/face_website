<template>
  <div class="train-model">
    <div class="section">
      <h2>🧠 Train Face Recognition Model</h2>
      <p class="description">
        Add training images for people you want to recognize. The system will extract face descriptors and store them.
      </p>

      <div class="form-group">
        <label for="personName">Person Name:</label>
        <input 
          id="personName"
          v-model="personName" 
          type="text" 
          placeholder="Enter person's name"
          class="input"
        />
      </div>

      <div class="upload-area" @dragover="isDragging = true" @dragleave="isDragging = false" @drop="handleDrop">
        <input 
          ref="fileInput"
          type="file" 
          accept="image/*"
          multiple
          @change="handleFileSelect"
          style="display: none"
        />
        <div :class="['drag-drop', { dragging: isDragging }]" @click="$refs.fileInput.click()">
          <p>📁 Drag and drop images or click to select</p>
          <p class="sub-text">Multiple images recommended (Min 2, Max 10)</p>
        </div>
      </div>

      <div v-if="selectedFiles.length > 0" class="files-list">
        <h3>Selected Files ({{ selectedFiles.length }})</h3>
        <ul>
          <li v-for="(file, index) in selectedFiles" :key="index">
            {{ file.name }} - {{ (file.size / 1024).toFixed(2) }}KB
          </li>
        </ul>
        <button @click="clearFiles" class="btn btn-secondary">Clear Selection</button>
      </div>

      <div class="controls">
        <button 
          @click="trainFaces" 
          :disabled="!personName || selectedFiles.length < 2 || isLoading"
          class="btn btn-primary"
        >
          {{ isLoading ? '⏳ Training...' : '🚀 Train Model' }}
        </button>
      </div>

      <div v-if="isLoading" class="loading">
        <div class="spinner"></div>
        <p>Extracting face descriptors and training...</p>
        <div v-if="processingStatus" class="status">{{ processingStatus }}</div>
      </div>

      <div v-if="successMessage" class="success">
        ✅ {{ successMessage }}
      </div>

      <div v-if="errorMessage" class="error">
        ❌ {{ errorMessage }}
      </div>
    </div>

    <div class="section">
      <h2>📊 Trained Model Status</h2>
      <div v-if="trainedFacesSummary" class="status-box">
        <p><strong>Total People Trained:</strong> {{ trainedFacesSummary.totalPeople }}</p>
        <div v-if="trainedFacesSummary.trainedFaces.length > 0" class="trained-list">
          <h4>Trained People:</h4>
          <div v-for="person in trainedFacesSummary.trainedFaces" :key="person.personName" class="trained-item">
            <span>{{ person.personName }}</span>
            <span class="badge">{{ person.count }} faces</span>
            <button @click="deletePerson(person.personName)" class="delete-btn">Delete</button>
          </div>
        </div>
        <button @click="loadTrainedFaces" class="btn btn-secondary">Refresh</button>
      </div>
      <div v-else class="no-data">
        No trained faces yet
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import * as faceapi from 'face-api.js'
import axios from 'axios'

export default {
  name: 'TrainModel',
  setup() {
    const personName = ref('')
    const selectedFiles = ref([])
    const isDragging = ref(false)
    const isLoading = ref(false)
    const errorMessage = ref('')
    const successMessage = ref('')
    const processingStatus = ref('')
    const trainedFacesSummary = ref(null)
    const fileInput = ref(null)

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

    const loadModels = async () => {
      try {
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/'
        await Promise.all([
          faceapi.nets.tinyFaceDetector.load(MODEL_URL),
          faceapi.nets.faceLandmark68Net.load(MODEL_URL),
          faceapi.nets.faceDescriptorNet.load(MODEL_URL)
        ])
        console.log('Face-API models loaded')
      } catch (error) {
        console.error('Error loading models:', error)
        errorMessage.value = 'Failed to load AI models'
      }
    }

    const handleFileSelect = (event) => {
      const files = Array.from(event.target.files)
      addFiles(files)
    }

    const handleDrop = (event) => {
      event.preventDefault()
      isDragging.value = false
      const files = Array.from(event.dataTransfer.files)
      const imageFiles = files.filter(file => file.type.startsWith('image/'))
      addFiles(imageFiles)
    }

    const addFiles = (files) => {
      if (files.length + selectedFiles.value.length > 10) {
        errorMessage.value = 'Maximum 10 images allowed'
        return
      }
      selectedFiles.value.push(...files)
      errorMessage.value = ''
    }

    const clearFiles = () => {
      selectedFiles.value = []
      if (fileInput.value) {
        fileInput.value.value = ''
      }
    }

    const trainFaces = async () => {
      if (!personName.value || selectedFiles.value.length < 2) {
        errorMessage.value = 'Person name and at least 2 images are required'
        return
      }

      isLoading.value = true
      errorMessage.value = ''
      successMessage.value = ''
      processingStatus.value = 'Loading images...'

      try {
        const faceDescriptors = []

        // Extract face descriptors from each image
        for (let i = 0; i < selectedFiles.value.length; i++) {
          const file = selectedFiles.value[i]
          processingStatus.value = `Processing image ${i + 1}/${selectedFiles.value.length}...`

          // Create image element from file
          const img = await createImageElement(file)

          // Detect faces in image
          const detections = await faceapi
            .detectAllFaces(img, new faceapi.TinyFaceDetectorOptions())
            .withFaceDescriptors()

          if (detections.length > 0) {
            // Extract descriptors
            detections.forEach(detection => {
              faceDescriptors.push(Array.from(detection.descriptor))
            })
            processingStatus.value = `Extracted ${faceDescriptors.length} face descriptors`
          } else {
            processingStatus.value = `Warning: No face found in ${file.name}`
          }
        }

        if (faceDescriptors.length === 0) {
          throw new Error('No faces found in any of the images')
        }

        processingStatus.value = `Uploading ${faceDescriptors.length} descriptors to server...`

        // Send to backend for training
        const response = await axios.post(`${API_URL}/api/face/train`, {
          personName: personName.value,
          faceDescriptors
        })

        successMessage.value = response.data.message
        personName.value = ''
        clearFiles()
        await loadTrainedFaces()
      } catch (error) {
        console.error('Training error:', error)
        errorMessage.value = error.message || 'Failed to train model'
      } finally {
        isLoading.value = false
        processingStatus.value = ''
      }
    }

    const createImageElement = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const img = new Image()
          img.onload = () => resolve(img)
          img.onerror = () => reject(new Error('Failed to load image'))
          img.src = e.target.result
        }
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsDataURL(file)
      })
    }

    const loadTrainedFaces = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/face/trained-faces`)
        trainedFacesSummary.value = response.data
      } catch (error) {
        console.error('Error loading trained faces:', error)
      }
    }

    const deletePerson = async (name) => {
      if (confirm(`Delete training data for ${name}?`)) {
        try {
          await axios.post(`${API_URL}/api/face/clear-model`, {
            personName: name
          })
          successMessage.value = `Deleted data for ${name}`
          await loadTrainedFaces()
        } catch (error) {
          errorMessage.value = 'Failed to delete'
        }
      }
    }

    onMounted(async () => {
      await loadModels()
      await loadTrainedFaces()
    })

    return {
      personName,
      selectedFiles,
      isDragging,
      isLoading,
      errorMessage,
      successMessage,
      processingStatus,
      trainedFacesSummary,
      fileInput,
      handleFileSelect,
      handleDrop,
      clearFiles,
      trainFaces,
      loadTrainedFaces,
      deletePerson
    }
  }
}
</script>

<style scoped>
.train-model {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.section h2 {
  margin-top: 0;
  color: #333;
  border-bottom: 2px solid #667eea;
  padding-bottom: 1rem;
}

.description {
  color: #666;
  margin: 1rem 0;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
}

.input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  font-family: inherit;
}

.input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.upload-area {
  margin: 1.5rem 0;
}

.drag-drop {
  border: 3px dashed #667eea;
  border-radius: 8px;
  padding: 2rem;
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
  font-size: 1rem;
  font-weight: 600;
}

.sub-text {
  font-size: 0.9rem !important;
  color: #999 !important;
  font-weight: normal !important;
  margin-top: 0.5rem !important;
}

.files-list {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
}

.files-list h3 {
  margin-top: 0;
  color: #333;
}

.files-list ul {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 1rem 0;
}

.files-list li {
  padding: 0.5rem;
  background: white;
  margin-bottom: 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  color: #666;
}

.controls {
  display: flex;
  gap: 1rem;
  margin: 2rem 0;
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
  flex: 1;
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
}

.loading {
  text-align: center;
  padding: 2rem;
  background: #f5f5f5;
  border-radius: 8px;
  margin: 1rem 0;
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

.status {
  font-size: 0.9rem;
  color: #666;
  margin-top: 0.5rem;
}

.success {
  background: #efe;
  color: #060;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #060;
  margin: 1rem 0;
}

.error {
  background: #fee;
  color: #c00;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #c00;
  margin: 1rem 0;
}

.status-box {
  background: #f9f9f9;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.status-box p {
  margin: 0.5rem 0;
  color: #333;
}

.trained-list {
  margin-top: 1rem;
}

.trained-list h4 {
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.trained-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  border: 1px solid #ddd;
}

.badge {
  background: #667eea;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
}

.delete-btn {
  background: #f44;
  color: white;
  border: none;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background 0.3s;
}

.delete-btn:hover {
  background: #c00;
}

.no-data {
  text-align: center;
  color: #999;
  padding: 2rem;
}

@media (max-width: 1024px) {
  .train-model {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .section {
    padding: 1rem;
  }

  .trained-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
