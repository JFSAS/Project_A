from flask import Blueprint, jsonify, send_from_directory, request, Response
import os
from pathlib import Path

# 创建蓝图
video_bp = Blueprint('videos', __name__)

# 视频存储的目录
VIDEO_FOLDER = Path("./asserts/videos")

@video_bp.route('/')
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

@video_bp.route('/<filename>')
def serve_video(filename):
    """提供视频文件，支持部分内容请求（用于视频拖拽播放）"""
    video_path = VIDEO_FOLDER / filename
    
    # 检查文件是否存在
    if not video_path.exists():
        return "视频不存在", 404
    
    # 处理范围请求（支持视频拖拽）
    range_header = request.headers.get('Range', None)
    
    if range_header:
        file_size = os.path.getsize(video_path)
        byte1, byte2 = 0, None
        
        m = range_header.replace('bytes=', '').split('-')
        byte1 = int(m[0])
        if m[1]:
            byte2 = int(m[1])
            
        if byte2 is None:
            byte2 = file_size - 1
            
        length = byte2 - byte1 + 1
        
        with open(video_path, 'rb') as f:
            f.seek(byte1)
            data = f.read(length)
            
        response = Response(
            data,
            206,
            mimetype="video/mp4",
            content_type='video/mp4',
            direct_passthrough=True
        )
        
        response.headers.add('Content-Range', f'bytes {byte1}-{byte2}/{file_size}')
        response.headers.add('Accept-Ranges', 'bytes')
        response.headers.add('Content-Length', str(length))
        return response
    
    # 如果不是范围请求，直接发送整个文件
    return send_from_directory(VIDEO_FOLDER, filename)