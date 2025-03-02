<template>
  <div class="title">camare 1</div>
  <div class="box">
    <el-row :gutter="20" class="left-side">
      <!-- 左侧视频播放区域 -->
      <el-col :span="12">
        <div class="video-container">
          <video ref="videoPlayer" width="100%" height="auto" autoplay controls>
            <source src="http://localhost:5000/api/videos/1414669237-1-192.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </el-col>
      <!-- 右侧表格区域 -->
      <el-col :span="12" class="right-side">
        <el-table :data="tableData" stripe>
          <el-table-column prop="image" label="人物图片">
            <template #default="scope">
              <img
                :src="scope.row.image"
                alt="人物图片"
                width="50"
                height="50"
              />
            </template>
          </el-table-column>
          <el-table-column prop="label" label="人物标签"></el-table-column>
          <el-table-column
            prop="suspicion"
            label="人物可疑度"
          ></el-table-column>
        </el-table>
      </el-col>
    </el-row>
</div>
</template>

<script setup>
import { ref, onMounted } from "vue";

// 定义视频播放器的引用
const videoPlayer = ref(null);
// 定义表格数据
const tableData = ref([]);

// 模拟动态更新表格数据
const updateTableData = () => {
  // 模拟从视频中读取到的信息
  const newData = [
    {
      image: "https://via.placeholder.com/50",
      label: "可疑人物",
      suspicion: "80%"
    },
    {
      image: "https://via.placeholder.com/50",
      label: "普通人物",
      suspicion: "20%"
    },
        {
      image: "https://via.placeholder.com/50",
      label: "普通人物",
      suspicion: "20%"
    },
        {
      image: "https://via.placeholder.com/50",
      label: "普通人物",
      suspicion: "20%"
    },
        {
      image: "https://via.placeholder.com/50",
      label: "普通人物",
      suspicion: "20%"
    },
        {
      image: "https://via.placeholder.com/50",
      label: "普通人物",
      suspicion: "20%"
    },
        {
      image: "https://via.placeholder.com/50",
      label: "普通人物",
      suspicion: "20%"
    },
        {
      image: "https://via.placeholder.com/50",
      label: "普通人物",
      suspicion: "20%"
    },
        {
      image: "https://via.placeholder.com/50",
      label: "普通人物",
      suspicion: "20%"
    },
        {
      image: "https://via.placeholder.com/50",
      label: "普通人物",
      suspicion: "20%"
    }
  ];
  tableData.value = newData;
};
updateTableData();
onMounted(() => {
  // 每 5 秒更新一次数据
  setInterval(() => {
    updateTableData();
  }, 0);
});
</script>

<style scoped>
/* 外层容器样式，用于整体居中 */

.box{
  height: 100%;
}

.left-side {
  height: 100%;
 /* Center content horizontally */
  align-items: center; /* Center content vertically */
}
  
.right-side {
  height: 100%;
  display: flex;
  justify-content: center; /* Center content horizontally */
  align-items: center; /* Center content vertically */
}

.title {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20px;
}

</style>
