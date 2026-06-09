<template>
  <div class="app">
    <header class="header">
      <h1>🎯 Face Recognition</h1>
      <p>Real-time face detection, training, and recognition</p>
    </header>

    <main class="container">
      <nav class="tabs-nav">
        <button 
          :class="['tab-btn', { active: activeTab === 'webcam' }]"
          @click="activeTab = 'webcam'"
          title="Real-time face detection from webcam"
        >
          <span class="icon">📷</span>
          <span class="label">Webcam</span>
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'upload' }]"
          @click="activeTab = 'upload'"
          title="Upload images for face detection"
        >
          <span class="icon">📁</span>
          <span class="label">Upload</span>
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'train' }]"
          @click="activeTab = 'train'"
          title="Train face recognition model"
        >
          <span class="icon">🧠</span>
          <span class="label">Train</span>
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'recognize' }]"
          @click="activeTab = 'recognize'"
          title="Recognize faces using trained model"
        >
          <span class="icon">🔍</span>
          <span class="label">Recognize</span>
        </button>
      </nav>

      <WebcamDetector v-if="activeTab === 'webcam'" />
      <ImageUploader v-if="activeTab === 'upload'" />
      <TrainModel v-if="activeTab === 'train'" />
      <FaceRecognizer v-if="activeTab === 'recognize'" />
    </main>

    <footer class="footer">
      <p>&copy; 2024 Face Recognition App. All rights reserved.</p>
    </footer>
  </div>
</template>

<script>
import { ref } from 'vue'
import WebcamDetector from './components/WebcamDetector.vue'
import ImageUploader from './components/ImageUploader.vue'
import TrainModel from './components/TrainModel.vue'
import FaceRecognizer from './components/FaceRecognizer.vue'

export default {
  name: 'App',
  components: {
    WebcamDetector,
    ImageUploader,
    TrainModel,
    FaceRecognizer
  },
  setup() {
    const activeTab = ref('webcam')

    return {
      activeTab
    }
  }
}
</script>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header {
  text-align: center;
  color: white;
  padding: 1.5rem 1rem;
  background: rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
}

.header h1 {
  margin: 0 0 0.5rem 0;
  font-size: clamp(1.5rem, 5vw, 2.5rem);
  font-weight: bold;
  word-break: break-word;
}

.header p {
  margin: 0;
  font-size: clamp(0.9rem, 3vw, 1.1rem);
  opacity: 0.9;
}

.container {
  flex: 1;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow-y: auto;
}

.tabs-nav {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  background: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: clamp(0.85rem, 2vw, 1rem);
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
  flex: 1 1 auto;
  min-width: 0;
  max-width: 150px;
  justify-content: center;
}

.tab-btn .icon {
  font-size: 1.2em;
  flex-shrink: 0;
}

.tab-btn .label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tab-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.tab-btn.active {
  background: #667eea;
  color: white;
}

.footer {
  text-align: center;
  padding: 1rem;
  color: white;
  background: rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
  font-size: clamp(0.8rem, 2vw, 1rem);
}

.footer p {
  margin: 0;
}

/* Tablet screens (max 1024px) */
@media (max-width: 1024px) {
  .container {
    padding: 0.75rem;
    gap: 1rem;
  }

  .tab-btn {
    max-width: 140px;
  }
}

/* Mobile screens (max 768px) */
@media (max-width: 768px) {
  .header {
    padding: 1rem 0.75rem;
  }

  .tabs-nav {
    gap: 0.5rem;
  }

  .tab-btn {
    max-width: 100%;
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
  }

  .tab-btn .icon {
    font-size: 1.1em;
  }
}

/* Small mobile screens (max 480px) */
@media (max-width: 480px) {
  .header {
    padding: 0.75rem 0.5rem;
  }

  .header h1 {
    margin-bottom: 0.3rem;
  }

  .container {
    padding: 0.5rem;
    gap: 0.75rem;
  }

  .tabs-nav {
    gap: 0.3rem;
    grid-template-columns: repeat(2, 1fr);
    display: grid;
  }

  .tab-btn {
    max-width: none;
    padding: 0.5rem;
    font-size: 0.75rem;
  }

  .tab-btn .label {
    display: none;
  }

  .footer {
    padding: 0.75rem 0.5rem;
    font-size: 0.75rem;
  }
}

/* Very small phones (max 360px) */
@media (max-width: 360px) {
  .header h1 {
    font-size: 1.2rem;
  }

  .header p {
    font-size: 0.8rem;
  }

  .tab-btn {
    padding: 0.4rem;
    font-size: 0.65rem;
  }

  .tab-btn .icon {
    font-size: 1rem;
  }
}
</style>
