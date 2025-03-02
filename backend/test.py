from service.video_processer import processor
import cv2
from pathlib import Path
import time
import matplotlib.pyplot as plt
import numpy as np
from threading import Thread
import queue

# 视频设置
video = Path("asserts/videos/1414669237-1-192.mp4")
if not video.exists():
    print("video is not found")
    
cap = cv2.VideoCapture(str(video))
if not cap.isOpened():
    print("can not open video")
    
# 获取视频信息
fps = cap.get(cv2.CAP_PROP_FPS)
frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

print(f"Video info: {width}x{height}, {fps} FPS, {frame_count} frames")

# 设置参数
TARGET_FPS = fps
FRAME_SKIP = 0  # 每处理一帧就跳过这么多帧
SCALE_FACTOR = 0.5  # 处理时的缩放因子

# 创建帧队列
frame_queue = queue.Queue(maxsize=30)
processor.processing_active = True

# 处理线程函数 - 只负责处理视频帧并放入队列
def process_frames():
    frame_index = 0
    while processor.processing_active and cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
            
            
        # 处理帧
        try:
            processed_frame, persons = processor.process_frame(frame)
        except Exception as e:
            print(f"处理帧时出错: {e}")
            frame_index += 1
            continue
        
        # 将BGR转为RGB
        processed_frame_rgb = cv2.cvtColor(processed_frame, cv2.COLOR_BGR2RGB)
        
        # 添加到队列
        frame_info = {
            'frame': processed_frame_rgb,
            'index': frame_index,
            'persons': persons
        }
        
        # 如果队列满了，移除最旧的帧
        if frame_queue.full():
            try:
                _ = frame_queue.get_nowait()
            except queue.Empty:
                pass
        
        frame_queue.put(frame_info)
        frame_index += 1
    
    # 设置处理完成标志
    frame_queue.put(None)
    print("Processing thread finished")

# 移除所有Matplotlib相关代码，用下面的代码代替

# 创建OpenCV窗口
cv2.namedWindow("Video Processing", cv2.WINDOW_NORMAL)
cv2.resizeWindow("Video Processing", 1280, 720)

# 启动处理线程
process_thread = Thread(target=process_frames)
process_thread.daemon = True
process_thread.start()

# 在主线程中显示图像
frame_time = 1.0 / TARGET_FPS
last_update_time = time.time()

try:
    while processor.processing_active and process_thread.is_alive():
        current_time = time.time()
        elapsed = current_time - last_update_time
        
        # 控制显示帧率
        if elapsed < frame_time:
            time.sleep( frame_time - elapsed)
            continue
            
        last_update_time = current_time
        
        try:
            frame_info = frame_queue.get(timeout=0.1)
            
            # 检查是否是结束信号
            if frame_info is None:
                break
                
            # OpenCV要求BGR格式，所以需要转换回来
            frame_bgr = cv2.cvtColor(frame_info['frame'], cv2.COLOR_RGB2BGR)
            
            # 在图像上添加信息
            cv2.putText(frame_bgr, 
                       f"Frame {frame_info['index']} - Detected {len(frame_info['persons'])} persons",
                       (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            
            # 显示图像
            cv2.imshow("Video Processing", frame_bgr)
            
            # 检查键盘输入，按ESC退出
            key = cv2.waitKey(1)
            if key == 27:  # ESC键
                processor.processing_active = False
                break
            
            # 输出检测信息
            if frame_info['persons']:
                print(f"Frame {frame_info['index']}: Detected {len(frame_info['persons'])} persons")
                
        except queue.Empty:
            cv2.waitKey(10)  # 队列为空时等待
            
except KeyboardInterrupt:
    print("Interrupted by user")
finally:
    processor.processing_active = False
    if process_thread.is_alive():
        process_thread.join(timeout=1.0)
    cap.release()
    cv2.destroyAllWindows()
    print("Cleanup complete")