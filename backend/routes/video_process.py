from flask import Blueprint, jsonify, request, Response
from extensions import socketio
from service.video_processer import processor
from pathlib import Path
import os
import cv2
import threading
import base64
import time



video_process_bp = Blueprint('videos', __name__)
VIDEO_FOLDER = Path("./asserts/videos")


@video_process_bp.route('/')
def list_videos():
    """返回可用视频列表"""
    if not VIDEO_FOLDER.exists():
        os.makedirs(VIDEO_FOLDER)
    
    videos = []
    for video_file in VIDEO_FOLDER.glob("*.mp4"):
        videos.append({
            "id": video_file.stem,
            "name": video_file.name,
            "path": f"/videos/{video_file.name}"
        })
    
    return jsonify(videos)


@video_process_bp.route('/<filename>')
def process_data(filename):
    """启动对指定视频的处理"""
    video_path = VIDEO_FOLDER / filename
    
    if not video_path.exists():
        return jsonify({"error": "视频文件不存在"}), 404
    
    # 清除之前的结果
    processor.detected_persons = []
    
    # 异步启动视频处理
    threading.Thread(target=process_video, args=(str(video_path), filename)).start()
    
    return jsonify({
        "status": "processing_started",
        "video": filename,
        "message": "视频处理已启动，结果将通过WebSocket实时发送"
    })

def process_video(video_path, filename):
    """处理整个视频并通过WebSocket发送结果"""
    print("start processing ", video_path)
    cap = cv2.VideoCapture(video_path)
    
    if not cap.isOpened():
        socketio.emit('processing_error', {'error': '无法打开视频'}, namespace='/video')
        return
    
    processor.processing_active = True
    
    # 获取视频属性
    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    # 发送视频信息
    socketio.emit('video_info', {
        'filename': filename,
        'fps': fps,
        'frame_count': frame_count
    }, namespace='/video')
    
    frame_index = 0
    
    while processor.processing_active:
        ret, frame = cap.read()
        
        if not ret:
            break

        # 处理帧
        processed_frame, persons = processor.process_frame(frame)
        

        # 将处理后的帧转换为JPEG并编码为base64
        _, buffer = cv2.imencode('.jpg', processed_frame)
        frame_base64 = base64.b64encode(buffer).decode('utf-8')
        
        # 发送帧和检测结果
        socketio.emit('detection_update', {
            'frame_index': frame_index,
            'timestamp': frame_index / fps,
            'persons': persons,
            'frame': frame_base64
        }, namespace='/video')
        
        # 更新全局结果
        processor.detected_persons.extend(persons)
        
        frame_index += 1
        
    
    cap.release()
    
    # 发送处理完成信号
    socketio.emit('processing_complete', {
        'total_persons': len(processor.detected_persons)
    }, namespace='/video')
    
    processor.processing_active = False

@video_process_bp.route('/stop')
def stop_processing():
    """停止当前视频处理"""
    processor.processing_active = False
    return jsonify({"status": "processing_stopped"})

@video_process_bp.route('/results')
def get_results():
    """获取当前处理结果"""
    return jsonify({
        "is_active": processor.processing_active,
        "detected_persons": processor.detected_persons
    })