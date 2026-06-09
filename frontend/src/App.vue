<template>
  <div class="app">
    <header class="header">
      <h1>🎯 Face Recognition</h1>
      <p>Real-time face detection and image upload recognition</p>
    </header>

    <main class="container">
      <div class="tabs">
        <button 
          :class="['tab-btn', { active: activeTab === 'webcam' }]"
          @click="activeTab = 'webcam'"
        >
          📷 Webcam
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'upload' }]"
          @click="activeTab = 'upload'"
        >
          📁 Upload Image
        </button>
      </div>

      <WebcamDetector v-if="activeTab === 'webcam'" />
      <ImageUploader v-if="activeTab === 'upload'" />
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

export default {
  name: 'App',
  components: {
    WebcamDetector,
    ImageUploader
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
  padding: 2rem 1rem;
  background: rgba(0, 0, 0, 0.2);
}

.header h1 {
  margin: 0;
  font-size: 2.5rem;
  font-weight: bold;
}

.header p {
  margin: 0.5rem 0 0 0;
  font-size: 1.1rem;
  opacity: 0.9;
}

.container {
  flex: 1;
  max-width: 1200px;
  margin: 2rem auto;
  width: 100%;
  padding: 0 1rem;
}

.tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  justify-content: center;
}

.tab-btn {
  padding: 0.75rem 1.5rem;
  background: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
  padding: 2rem;
  color: white;
  background: rgba(0, 0, 0, 0.2);
}

.footer p {
  margin: 0;
}

@media (max-width: 768px) {
  .header h1 {
    font-size: 2rem;
  }

  .tabs {
    flex-direction: column;
  }

  .tab-btn {
    width: 100%;
  }
}
</style>
