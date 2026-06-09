<template>
  <div class="face-display">
    <h2>Detection Results</h2>
    
    <div class="results-container">
      <div class="image-section">
        <img v-if="imagePath" :src="imagePath" alt="Uploaded image" class="result-image" />
      </div>

      <div class="detections-section">
        <div v-if="detections && detections.length > 0" class="detections-list">
          <h3>Detected Faces: {{ detections.length }}</h3>
          
          <div v-for="(detection, index) in detections" :key="index" class="detection-card">
            <h4>Face {{ index + 1 }}</h4>
            
            <div class="detection-info">
              <p><strong>Confidence:</strong> {{ (detection.confidence * 100).toFixed(2) }}%</p>
              <p><strong>Position:</strong> X: {{ Math.round(detection.x) }}, Y: {{ Math.round(detection.y) }}</p>
              <p><strong>Size:</strong> {{ Math.round(detection.width) }}x{{ Math.round(detection.height) }}px</p>
            </div>

            <div v-if="detection.emotions" class="emotions">
              <h5>Emotions Detected:</h5>
              <div class="emotion-bars">
                <div v-for="(score, emotion) in detection.emotions" :key="emotion" class="emotion-bar">
                  <span class="emotion-name">{{ emotion }}</span>
                  <div class="bar">
                    <div class="progress" :style="{ width: (score * 100) + '%' }"></div>
                  </div>
                  <span class="score">{{ (score * 100).toFixed(1) }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="no-faces">
          <p>No faces detected in the image</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FaceDisplay',
  props: {
    detections: {
      type: Array,
      required: true
    },
    imagePath: {
      type: String,
      required: true
    }
  }
}
</script>

<style scoped>
.face-display {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-top: 2rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.face-display h2 {
  color: #333;
  margin-top: 0;
  border-bottom: 2px solid #667eea;
  padding-bottom: 1rem;
}

.results-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-top: 1.5rem;
}

.image-section {
  display: flex;
  justify-content: center;
  align-items: center;
}

.result-image {
  max-width: 100%;
  max-height: 500px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.detections-section {
  display: flex;
  flex-direction: column;
}

.detections-list h3 {
  color: #667eea;
  margin-top: 0;
}

.detection-card {
  background: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.detection-card h4 {
  margin-top: 0;
  color: #333;
}

.detection-info {
  background: white;
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 1rem;
}

.detection-info p {
  margin: 0.25rem 0;
  color: #666;
  font-size: 0.9rem;
}

.emotions h5 {
  margin-top: 0;
  color: #333;
}

.emotion-bars {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.emotion-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
}

.emotion-name {
  min-width: 70px;
  color: #666;
  font-weight: 500;
}

.bar {
  flex: 1;
  height: 20px;
  background: #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.3s ease;
}

.score {
  min-width: 40px;
  text-align: right;
  color: #999;
}

.no-faces {
  text-align: center;
  padding: 2rem;
  color: #999;
}

@media (max-width: 768px) {
  .face-display {
    padding: 1rem;
  }

  .results-container {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .result-image {
    max-height: 300px;
  }
}
</style>
