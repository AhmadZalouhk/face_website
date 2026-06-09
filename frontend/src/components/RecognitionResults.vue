<template>
  <div class="recognition-results">
    <h2>Recognition Results</h2>

    <div class="results-container">
      <div class="image-section">
        <div class="image-wrapper">
          <img v-if="imagePath" :src="imagePath" alt="Test image" class="result-image" />
          <canvas 
            ref="canvasElement"
            class="detection-canvas"
          ></canvas>
        </div>
      </div>

      <div class="detections-section">
        <div class="summary">
          <h3>Summary</h3>
          <p>Total Faces Found: <strong>{{ results.total }}</strong></p>
          <p>Recognized: <strong :style="{ color: recognizedCount() > 0 ? '#28a745' : '#999' }">
            {{ recognizedCount() }} / {{ results.total }}
          </strong></p>
        </div>

        <div v-if="results.results.length > 0" class="results-list">
          <h3>Detailed Results</h3>
          
          <div v-for="(result, index) in results.results" :key="index" class="result-card">
            <div class="result-header">
              <h4>Face {{ index + 1 }}</h4>
              <span v-if="result.recognized" class="badge-recognized">✅ Recognized</span>
              <span v-else class="badge-unknown">❓ Unknown</span>
            </div>

            <div v-if="result.recognized && result.match" class="match-info">
              <div class="person-name">
                <span class="label">Person:</span>
                <span class="name">{{ result.match.personName }}</span>
              </div>
              <div class="confidence">
                <span class="label">Confidence:</span>
                <span class="value">{{ (result.match.confidence * 100).toFixed(1) }}%</span>
              </div>
            </div>

            <div v-else class="unknown-info">
              <p>This face doesn't match any trained person</p>
              <p class="distance">Distance: {{ result.distance.toFixed(3) }}</p>
            </div>

            <div v-if="result.box" class="position-info">
              <span class="label">Position:</span>
              <span>X: {{ Math.round(result.box.x) }}, Y: {{ Math.round(result.box.y) }}</span>
              <br>
              <span class="label">Size:</span>
              <span>{{ Math.round(result.box.width) }}x{{ Math.round(result.box.height) }}px</span>
            </div>

            <div v-if="result.expressions && Object.keys(result.expressions).length > 0" class="expressions">
              <h5>Expression:</h5>
              <div class="expression-bars">
                <div 
                  v-for="(score, emotion) in getTopExpressions(result.expressions)" 
                  :key="emotion"
                  class="expression-bar"
                >
                  <span class="emotion-name">{{ emotion }}</span>
                  <div class="bar">
                    <div class="progress" :style="{ width: (score * 100) + '%' }"></div>
                  </div>
                  <span class="score">{{ (score * 100).toFixed(0) }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'

export default {
  name: 'RecognitionResults',
  props: {
    results: {
      type: Object,
      required: true
    },
    imagePath: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const canvasElement = ref(null)

    const recognizedCount = () => {
      return props.results.results.filter(r => r.recognized).length
    }

    const getTopExpressions = (expressions) => {
      return Object.entries(expressions)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .reduce((obj, [key, value]) => {
          obj[key] = value
          return obj
        }, {})
    }

    const drawDetections = () => {
      if (!canvasElement.value || !props.imagePath) return

      const canvas = canvasElement.value
      const img = new Image()

      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height

        const ctx = canvas.getContext('2d')

        props.results.results.forEach((result, index) => {
          if (!result.box) return

          const box = result.box
          const isRecognized = result.recognized

          // Draw bounding box
          ctx.strokeStyle = isRecognized ? '#28a745' : '#ffc107'
          ctx.lineWidth = 3
          ctx.strokeRect(box.x, box.y, box.width, box.height)

          // Draw label
          const label = isRecognized 
            ? `${result.match.personName} (${(result.match.confidence * 100).toFixed(0)}%)`
            : 'Unknown'

          ctx.fillStyle = isRecognized ? '#28a745' : '#ffc107'
          ctx.font = 'bold 14px Arial'
          ctx.fillRect(box.x, box.y - 30, ctx.measureText(label).width + 10, 25)

          ctx.fillStyle = 'white'
          ctx.fillText(label, box.x + 5, box.y - 10)
        })
      }

      img.src = props.imagePath
    }

    onMounted(() => {
      drawDetections()
    })

    watch(() => props.results, () => {
      drawDetections()
    }, { deep: true })

    return {
      canvasElement,
      recognizedCount,
      getTopExpressions
    }
  }
}
</script>

<style scoped>
.recognition-results {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  margin-top: 2rem;
}

.recognition-results h2 {
  margin-top: 0;
  color: #333;
  border-bottom: 2px solid #667eea;
  padding-bottom: 1rem;
}

.results-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin: 2rem 0;
}

.image-section {
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-wrapper {
  position: relative;
  display: inline-block;
}

.result-image {
  max-width: 100%;
  max-height: 500px;
  border-radius: 8px;
  display: block;
}

.detection-canvas {
  position: absolute;
  top: 0;
  left: 0;
}

.detections-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.summary {
  background: #f5f5f5;
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.summary h3 {
  margin-top: 0;
  color: #333;
}

.summary p {
  margin: 0.5rem 0;
  color: #666;
}

.results-list h3 {
  color: #333;
  margin-top: 0;
}

.result-card {
  background: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  border-bottom: 1px solid #ddd;
  padding-bottom: 0.5rem;
}

.result-header h4 {
  margin: 0;
  color: #333;
}

.badge-recognized {
  background: #28a745;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
}

.badge-unknown {
  background: #ffc107;
  color: #333;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
}

.match-info {
  background: white;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
}

.person-name {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.person-name .label {
  font-weight: 600;
  color: #666;
}

.person-name .name {
  font-size: 1.1rem;
  font-weight: bold;
  color: #28a745;
}

.confidence {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.confidence .label {
  font-weight: 600;
  color: #666;
}

.confidence .value {
  font-weight: 600;
  color: #667eea;
}

.unknown-info {
  background: white;
  padding: 1rem;
  border-radius: 6px;
  text-align: center;
  color: #666;
}

.distance {
  font-size: 0.9rem;
  color: #999;
}

.position-info {
  font-size: 0.9rem;
  color: #666;
  background: white;
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 1rem;
}

.position-info .label {
  font-weight: 600;
  color: #333;
}

.expressions {
  background: white;
  padding: 1rem;
  border-radius: 6px;
}

.expressions h5 {
  margin-top: 0;
  color: #333;
}

.expression-bars {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.expression-bar {
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

@media (max-width: 1024px) {
  .results-container {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .recognition-results {
    padding: 1rem;
  }

  .result-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
