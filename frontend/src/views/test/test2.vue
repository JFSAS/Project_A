<template>
  <div class="video-processor">
    <div class="video-container">
      <!-- 实时视频显示 -->
      <img
        v-if="currentFrame"
        :src="currentFrame"
        class="video-frame"
        alt="处理后的视频"
      />
      <div v-else class="placeholder">等待视频处理...</div>

      <!-- 处理信息叠加层 -->
      <div class="info-overlay">
        <div class="info-item">
          处理帧: {{ processedFrames }}/{{ totalFrames }}
        </div>
        <div class="info-item">检测到的人数: {{ detectedPersons.length }}</div>
        <div class="info-item">状态: {{ status }}</div>
      </div>
    </div>

    <div class="controls">
      <div class="video-selector">
        <select v-model="selectedVideo" :disabled="isProcessing">
          <option value="">选择视频...</option>
          <option
            v-for="video in availableVideos"
            :key="video.id"
            :value="video.name"
          >
            {{ video.name }}
          </option>
        </select>
      </div>

      <div class="buttons">
        <button
          @click="startProcessing"
          :disabled="!selectedVideo || isProcessing"
          class="btn btn-start"
        >
          开始处理
        </button>

        <button
          @click="stopProcessing"
          :disabled="!isProcessing"
          class="btn btn-stop"
        >
          停止处理
        </button>
      </div>
    </div>

    <!-- 检测结果面板 -->
    <div class="detection-results">
      <h3>检测到的人员 ({{ detectedPersons.length }})</h3>
      <div v-if="detectedPersons.length === 0" class="no-results">
        尚未检测到人员
      </div>
      <transition-group name="person-list" tag="div" class="results-list">
        <div
          v-for="(person, index) in detectedPersons"
          :key="person.id || index"
          class="person-item"
        >
          <div class="person-header">
            <strong>Person #{{ detectedPersons.length - index }}</strong>
            <span class="time">{{ formatTime(person.timestamp) }}</span>
          </div>
          <div class="person-details">
            <div>
              位置: X={{ Math.round(person.box[0]) }}, Y={{
                Math.round(person.box[1])
              }}
            </div>
            <div>
              尺寸: {{ Math.round(person.box[2]) }}x{{
                Math.round(person.box[3])
              }}
            </div>
            <div>置信度: {{ (person.confidence * 100).toFixed(1) }}%</div>
          </div>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { io } from "socket.io-client";

const socket = ref(null);
const availableVideos = ref([]);
const selectedVideo = ref("");
const currentFrame = ref("");
const processedFrames = ref(0);
const totalFrames = ref(0);
const isProcessing = ref(false);
const status = ref("就绪");
const detectedPersons = ref([]);

// 初始化Socket.IO连接
const initSocket = () => {
  socket.value = io("http://localhost:5000/video");
  console.log(socket.value);
  if (!socket.value) {
    console.error("WebSocket连接失败");
    return;
  }
  // 连接事件
  socket.value.on("connect", () => {
    console.log("WebSocket连接成功");
  });

  //连接失败
  socket.value.on('connect_error', (error) => {
  console.log('连接错误:', error.message);
  });
  // 视频信息事件
  socket.value.on("video_info", data => {
    console.log("接收到视频信息:", data);
    totalFrames.value = data.frame_count;
    status.value = "处理中...";
  });

  // 检测更新事件
  socket.value.on("detection_update", data => {
    // 更新当前帧
    processedFrames.value = data.frame_index;
    currentFrame.value = `data:image/jpeg;base64,${data.frame}`;

    // 添加新检测到的人员（避免重复）
    data.persons.forEach(person => {
      // 添加时间戳
      const personWithTime = {
        ...person,
        timestamp: data.timestamp
      };

      // 检查是否存在重复（这里简化处理，实际可能需要更复杂的去重逻辑）
      const existingIndex = detectedPersons.value.findIndex(
        p => p.box[0] === person.box[0] && p.box[1] === person.box[1]
      );

      if (existingIndex === -1) {
        detectedPersons.value.unshift(personWithTime);
      }
    });
  });

  // 处理完成事件
  socket.value.on("processing_complete", data => {
    console.log("处理完成:", data);
    status.value = `处理完成，共检测到 ${data.total_persons} 个人`;
    isProcessing.value = false;
  });

  // 处理错误事件
  socket.value.on("processing_error", data => {
    console.error("处理错误:", data);
    status.value = `错误: ${data.error}`;
    isProcessing.value = false;
  });
};

// 获取可用视频列表
const fetchVideos = async () => {
  try {
    const response = await fetch("/api/videos/");
    const data = await response.json();
    availableVideos.value = data;
  } catch (error) {
    console.error("获取视频列表失败:", error);
    status.value = "获取视频列表失败";
  }
};

// 开始处理视频
const startProcessing = async () => {
  if (!selectedVideo.value) return;

  try {
    // 重置状态
    detectedPersons.value = [];
    currentFrame.value = "";
    processedFrames.value = 0;
    status.value = "初始化处理...";
    isProcessing.value = true;

    // 发送处理请求
    const response = await fetch(`/api/videos/${selectedVideo.value}`);
    const data = await response.json();
    console.log("处理请求响应:", data);
  } catch (error) {
    console.error("启动处理失败:", error);
    status.value = "启动处理失败";
    isProcessing.value = false;
  }
};

// 停止处理
const stopProcessing = async () => {
  try {
    const response = await fetch("/api/videos/stop");
    const data = await response.json();
    console.log("停止处理响应:", data);
    status.value = "处理已停止";
    isProcessing.value = false;
  } catch (error) {
    console.error("停止处理失败:", error);
  }
};

// 格式化时间
const formatTime = seconds => {
  const date = new Date(seconds * 1000);
  const hours = date.getUTCHours().toString().padStart(2, "0");
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");
  const secs = date.getUTCSeconds().toString().padStart(2, "0");
  const ms = date.getUTCMilliseconds().toString().padStart(3, "0");
  return `${hours}:${minutes}:${secs}.${ms}`;
};

// 组件挂载时
onMounted(() => {
  initSocket();
  fetchVideos();
});

// 组件卸载前
onBeforeUnmount(() => {
  if (socket.value) {
    socket.value.disconnect();
  }
});
</script>

<style scoped>
.video-processor {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.video-container {
  position: relative;
  width: 100%;
  background-color: #000;
  aspect-ratio: 16/9;
  border-radius: 8px;
  overflow: hidden;
}

.video-frame {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
  font-size: 1.5rem;
}

.info-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 10px;
  display: flex;
  justify-content: space-between;
}

.controls {
  display: flex;
  gap: 15px;
  align-items: center;
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
}

.video-selector {
  flex-grow: 1;
}

.video-selector select {
  width: 100%;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.buttons {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-start {
  background-color: #4caf50;
  color: white;
}

.btn-start:hover:not(:disabled) {
  background-color: #45a049;
}

.btn-stop {
  background-color: #f44336;
  color: white;
}

.btn-stop:hover:not(:disabled) {
  background-color: #d32f2f;
}

.detection-results {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  max-height: 400px;
  overflow-y: auto;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.person-item {
  padding: 12px;
  background-color: white;
  border-left: 4px solid #4caf50;
  border-radius: 4px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.person-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.time {
  color: #666;
  font-size: 0.9rem;
}

.person-details {
  font-size: 0.9rem;
  color: #444;
}

.no-results {
  text-align: center;
  padding: 20px;
  color: #666;
  font-style: italic;
}

/* 动画效果 */
.person-list-enter-active,
.person-list-leave-active {
  transition: all 0.5s ease;
}

.person-list-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.person-list-leave-to {
  opacity: 0;
  transform: translateX(100px);
}
</style>
