<template>
  <div class="webcam-detector">
    <div class="video-container">
      <video 
        ref="videoElement"
        autoplay
        playsinline
        muted
        @play="onVideoPlay"
      ></video>
      <canvas 
        ref="canvasElement"
        class="detection-canvas"
      ></canvas>
    </div>

    <div class="controls">
      <button @click="toggleDetection" :class="['btn', { active: isDetecting }]">
        {{ isDetecting ? '⏸ Stop Detection' : '▶ Start Detection' }}
      </button>
      <button @click="requestCameraAccess" class="btn">
        🎥 Request Camera Access
      </button>
    </div>

    <div v-if="detectionStats" class="stats">
      <h3>Detection Stats</h3>
      <p>Faces detected: <strong>{{ detectionStats.facesCount }}</strong></p>
      <p>FPS: <strong>{{ detectionStats.fps }}</strong></p>
      <p>Time: <strong>{{ detectionStats.time }}ms</strong></p>
    </div>

    <div v-if="errorMessage" class="error">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import * as faceapi from 'face-api.js'

export default {
  name: 'WebcamDetector',
  setup() {
    const videoElement = ref(null)
    const canvasElement = ref(null)
    const isDetecting = ref(false)
    const detectionStats = ref(null)
    const errorMessage = ref('')
    let detectionInterval = null
    let frameCount = 0
    let lastTime = Date.now()

    const loadModels = async () => {
      try {
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/'
        await Promise.all([
          faceapi.nets.tinyFaceDetector.load(MODEL_URL),
          faceapi.nets.faceLandmark68Net.load(MODEL_URL),
          faceapi.nets.faceExpressionNet.load(MODEL_URL),
          faceapi.nets.faceDescriptorNet.load(MODEL_URL)
        ])
        console.log('Models loaded successfully')
      } catch (error) {
        console.error('Error loading models:', error)
        errorMessage.value = 'Failed to load AI models'
      }
    }

    const requestCameraAccess = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } }
        })
        videoElement.value.srcObject = stream
        errorMessage.value = ''
      } catch (error) {
        console.error('Camera access denied:', error)
        errorMessage.value = 'Camera access denied. Please enable camera permissions.'
      }
    }

    const onVideoPlay = () => {
      const canvas = canvasElement.value
      canvas.width = videoElement.value.videoWidth
      canvas.height = videoElement.value.videoHeight
    }

    const detectFaces = async () => {
      const video = videoElement.value
      const canvas = canvasElement.value

      if (video.paused || video.ended) {
        return
      }

      try {
        const startTime = performance.now()

        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions()

        const endTime = performance.now()
        const time = endTime - startTime

        // Draw detections
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        detections.forEach(detection => {
          const box = detection.detection.box
          
          // Draw bounding box
          ctx.strokeStyle = '#00ff00'
          ctx.lineWidth = 3
          ctx.strokeRect(box.x, box.y, box.width, box.height)

          // Draw confidence
          const confidence = (detection.detection.score * 100).toFixed(1)
          ctx.fillStyle = '#00ff00'
          ctx.font = 'bold 16px Arial'
          ctx.fillText(`${confidence}%`, box.x, box.y - 10)

          // Draw expression
          const expression = Object.entries(detection.expressions)
            .reduce((a, b) => a[1] > b[1] ? a : b)[0]
          ctx.fillText(expression, box.x, box.y + box.height + 25)
        })

        // Update stats
        frameCount++
        const currentTime = Date.now()
        const elapsed = (currentTime - lastTime) / 1000

        if (elapsed >= 1) {
          detectionStats.value = {
            facesCount: detections.length,
            fps: Math.round(frameCount / elapsed),
            time: Math.round(time)
          }
          frameCount = 0
          lastTime = currentTime
        }
      } catch (error) {
        console.error('Detection error:', error)
      }
    }

    const toggleDetection = () => {
      isDetecting.value = !isDetecting.value

      if (isDetecting.value) {
        detectionInterval = setInterval(detectFaces, 100)
      } else {
        clearInterval(detectionInterval)
      }
    }

    onMounted(async () => {
      await loadModels()
      await requestCameraAccess()
    })

    onUnmounted(() => {
      if (detectionInterval) {
        clearInterval(detectionInterval)
      }
      if (videoElement.value && videoElement.value.srcObject) {
        videoElement.value.srcObject.getTracks().forEach(track => track.stop())
      }
    })

    return {
      videoElement,
      canvasElement,
      isDetecting,
      detectionStats,
      errorMessage,
      toggleDetection,
      requestCameraAccess,
      onVideoPlay
    }
  }
}
</script>

<style scoped>
.webcam-detector {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.video-container {
  position: relative;
  width: 100%;
  max-width: 800px;
  margin: 0 auto 2rem;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
}

video {
  width: 100%;
  height: auto;
  display: block;
}

.detection-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
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
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn:hover {
  background: #5568d3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn.active {
  background: #764ba2;
}

.stats {
  background: #f5f5f5;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.stats h3 {
  margin-top: 0;
  color: #333;
}

.stats p {
  margin: 0.5rem 0;
  color: #666;
}

.error {
  background: #fee;
  color: #c00;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #c00;
}

@media (max-width: 768px) {
  .webcam-detector {
    padding: 1rem;
  }

  .controls {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
