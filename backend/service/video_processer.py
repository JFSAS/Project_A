from flask import Blueprint, jsonify, request, Response
import os
from pathlib import Path
import cv2
import numpy as np
import time

class VideoProcessor:
    def __init__(self):
        # 加载人体检测模型
        self.hog = cv2.HOGDescriptor()
        self.hog.setSVMDetector(cv2.HOGDescriptor_getDefaultPeopleDetector())
        
        # 存储检测结果
        self.detected_persons = []
        self.current_frame = None
        self.processing_active = False
    
    def process_frame(self, frame):
        """处理单个帧，检测人体"""
        # 调整尺寸以加速处理
        frame = cv2.resize(frame, (640, 480))
        
        # 执行人体检测
        boxes, weights = self.hog.detectMultiScale(
            frame, 
            winStride=(8, 8),
            padding=(4, 4), 
            scale=1.05
        )
        
        # 处理检测结果
        persons = []
        for i, (x, y, w, h) in enumerate(boxes):
            person_id = f"person_{int(time.time())}_{i}"
            confidence = float(weights[i])
            
            persons.append({
                "id": person_id,
                "box": [int(x), int(y), int(w), int(h)],
                "confidence": confidence
            })
            
            # 在帧上绘制边界框
            cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
        
        return frame, persons

# 全局视频处理器实例
processor = VideoProcessor()