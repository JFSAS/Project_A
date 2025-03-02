from flask import Flask, jsonify, Blueprint
import os
from pathlib import Path
from flask_socketio import SocketIO, Namespace
from routes import video_bp, VIDEO_FOLDER, video_process_bp
from extensions import socketio


app = Flask(__name__)
socketio.init_app(app, cors_allowed_origins="*")
socketio.on_namespace(Namespace('/video'))
api_bp = Blueprint('api', __name__)


# 首先定义蓝图的所有路由
@app.route('/')
def home():
    """应用主页"""
    return jsonify({"message": "欢迎访问视频服务API", "endpoints": ["/videos"]})



api_bp.register_blueprint(video_process_bp, url_prefix='/videos')
app.register_blueprint(api_bp, url_prefix='/api')




if __name__ == '__main__':
    # 确保视频目录存在
    if not VIDEO_FOLDER.exists():
        os.makedirs(VIDEO_FOLDER)
    
    socketio.run(app, debug=True) 
    