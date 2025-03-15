// City Situation Awareness Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Mock data for alerts
    const alertsData = [
        {
            id: 1,
            title: '可疑人员出现',
            time: new Date(2023, 5, 15, 9, 30),
            content: '监控系统在北区商场检测到与通缉犯相似度达85%的可疑人员，建议派遣警力核查。',
            location: '北区商场',
            severity: 'high'
        },
        {
            id: 2,
            title: '异常行为检测',
            time: new Date(2023, 5, 15, 10, 15),
            content: '东区公园监控发现有人在限制区域逗留时间过长，行为异常，建议关注。',
            location: '东区公园',
            severity: 'medium'
        },
        {
            id: 3,
            title: '车辆异常聚集',
            time: new Date(2023, 5, 15, 11, 45),
            content: '西区停车场检测到多辆无牌照车辆聚集，可能存在安全隐患。',
            location: '西区停车场',
            severity: 'high'
        },
        {
            id: 4,
            title: '人流密度预警',
            time: new Date(2023, 5, 15, 12, 30),
            content: '中央广场人流密度超过安全阈值，建议加强现场管控，防止踩踏事件。',
            location: '中央广场',
            severity: 'medium'
        },
        {
            id: 5,
            title: '设备离线警告',
            time: new Date(2023, 5, 15, 13, 10),
            content: '南区3号监控设备离线，请技术人员前往检查。',
            location: '南区',
            severity: 'low'
        }
    ];

    // Render alerts
    renderAlerts(alertsData);

    // Simulate new alerts coming in
    setInterval(() => {
        const newAlert = generateRandomAlert();
        alertsData.unshift(newAlert);
        if (alertsData.length > 10) {
            alertsData.pop();
        }
        renderAlerts(alertsData);
        showNotification(`新预警: ${newAlert.title}`, 'warning');
    }, 30000); // Every 30 seconds

    // Add hotspot click events
    setupHotspotEvents();

    // Setup camera feed interactions
    setupCameraFeeds();
    
    // Setup view switching
    setupViewSwitching();
    
    // Setup main video and video list interactions
    setupVideoInteractions();
});

// Render alerts in the alerts container
function renderAlerts(alerts) {
    const alertsContainer = document.querySelector('.alerts-container');
    if (!alertsContainer) return;

    alertsContainer.innerHTML = '';
    
    alerts.forEach(alert => {
        const alertElement = document.createElement('div');
        alertElement.className = 'alert-item';
        alertElement.innerHTML = `
            <div class="alert-header">
                <div class="alert-title">
                    <span class="status status-${alert.severity}"></span>
                    ${alert.title}
                </div>
                <div class="alert-time">${formatTime(alert.time)}</div>
            </div>
            <div class="alert-content">${alert.content}</div>
            <div class="alert-footer">
                <div class="alert-location">
                    <i class="fas fa-map-marker-alt"></i> ${alert.location}
                </div>
                <div class="alert-severity ${alert.severity}">
                    ${getSeverityText(alert.severity)}
                </div>
            </div>
        `;
        
        alertsContainer.appendChild(alertElement);
    });
}

// Get severity text based on severity level
function getSeverityText(severity) {
    switch(severity) {
        case 'high':
            return '高风险';
        case 'medium':
            return '中风险';
        case 'low':
            return '低风险';
        default:
            return '未知';
    }
}

// Generate a random alert for simulation
function generateRandomAlert() {
    const titles = ['可疑人员出现', '异常行为检测', '车辆异常聚集', '人流密度预警', '设备离线警告'];
    const locations = ['北区商场', '东区公园', '西区停车场', '中央广场', '南区', '火车站', '市政大厅'];
    const contents = [
        '监控系统检测到与通缉犯相似度高的可疑人员，建议派遣警力核查。',
        '监控发现有人在限制区域逗留时间过长，行为异常，建议关注。',
        '检测到多辆无牌照车辆聚集，可能存在安全隐患。',
        '人流密度超过安全阈值，建议加强现场管控，防止踩踏事件。',
        '监控设备离线，请技术人员前往检查。',
        '检测到异常声音事件，可能存在冲突或打斗。',
        '发现有人携带可疑物品，建议进行检查。'
    ];
    const severities = ['high', 'medium', 'low'];
    
    return {
        id: Date.now(),
        title: titles[Math.floor(Math.random() * titles.length)],
        time: new Date(),
        content: contents[Math.floor(Math.random() * contents.length)],
        location: locations[Math.floor(Math.random() * locations.length)],
        severity: severities[Math.floor(Math.random() * severities.length)]
    };
}

// Setup hotspot click events
function setupHotspotEvents() {
    const hotspots = document.querySelectorAll('.hotspot');
    
    hotspots.forEach(hotspot => {
        hotspot.addEventListener('click', function() {
            const location = this.getAttribute('data-location');
            const density = this.getAttribute('data-density');
            const count = this.getAttribute('data-count');
            const status = this.getAttribute('data-status');
            
            showNotification(`正在查看 ${location} 的详细信息`, 'info');
            
            // Highlight the selected hotspot
            hotspots.forEach(h => h.classList.remove('selected'));
            this.classList.add('selected');
            
            // Simulate loading data
            setTimeout(() => {
                // Here you would typically load detailed data for the location
                showNotification(`${location} 数据加载完成`, 'success');
                
                // Update the main video to show the selected location
                const cameraFeeds = document.querySelectorAll('.camera-feed');
                cameraFeeds.forEach(feed => {
                    const feedLocation = feed.querySelector('.camera-location');
                    if (feedLocation && feedLocation.textContent.includes(location)) {
                        feed.click();
                    }
                });
            }, 1000);
        });
    });
    
    // Setup heatmap controls
    setupHeatmapControls();
}

// Setup heatmap controls
function setupHeatmapControls() {
    const heatmap = document.querySelector('.heatmap');
    const mapBackground = document.querySelector('.map-background');
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    const resetViewBtn = document.getElementById('reset-view');
    const refreshHeatmapBtn = document.getElementById('refresh-heatmap');
    const fullscreenHeatmapBtn = document.getElementById('fullscreen-heatmap');
    
    if (!heatmap || !mapBackground) return;
    
    let scale = 1;
    let translateX = 0;
    let translateY = 0;
    let isDragging = false;
    let startX, startY;
    
    // Zoom in button
    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', function() {
            if (scale < 2) {
                scale += 0.2;
                updateMapTransform();
            }
        });
    }
    
    // Zoom out button
    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', function() {
            if (scale > 0.6) {
                scale -= 0.2;
                updateMapTransform();
            }
        });
    }
    
    // Reset view button
    if (resetViewBtn) {
        resetViewBtn.addEventListener('click', function() {
            scale = 1;
            translateX = 0;
            translateY = 0;
            updateMapTransform();
        });
    }
    
    // Refresh heatmap button
    if (refreshHeatmapBtn) {
        refreshHeatmapBtn.addEventListener('click', function() {
            const button = this;
            button.querySelector('i').classList.add('fa-spin');
            
            // Simulate refreshing data
            setTimeout(() => {
                button.querySelector('i').classList.remove('fa-spin');
                updateHeatmapData();
                showNotification('热力图数据已更新', 'success');
            }, 1500);
        });
    }
    
    // Fullscreen button
    if (fullscreenHeatmapBtn) {
        fullscreenHeatmapBtn.addEventListener('click', function() {
            toggleFullscreen(heatmap);
        });
    }
    
    // Mouse wheel zoom
    heatmap.addEventListener('wheel', function(e) {
        e.preventDefault();
        
        if (e.deltaY < 0) {
            // Zoom in
            if (scale < 2) scale += 0.1;
        } else {
            // Zoom out
            if (scale > 0.6) scale -= 0.1;
        }
        
        updateMapTransform();
    });
    
    // Pan functionality
    heatmap.addEventListener('mousedown', function(e) {
        isDragging = true;
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
        heatmap.style.cursor = 'grabbing';
    });
    
    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        
        translateX = e.clientX - startX;
        translateY = e.clientY - startY;
        
        // Limit panning
        const maxTranslate = 200 * scale;
        translateX = Math.max(-maxTranslate, Math.min(translateX, maxTranslate));
        translateY = Math.max(-maxTranslate, Math.min(translateY, maxTranslate));
        
        updateMapTransform();
    });
    
    document.addEventListener('mouseup', function() {
        isDragging = false;
        heatmap.style.cursor = 'grab';
    });
    
    // Double click to zoom in
    heatmap.addEventListener('dblclick', function(e) {
        if (scale < 2) {
            scale += 0.3;
            updateMapTransform();
        }
    });
    
    // Update map transform
    function updateMapTransform() {
        mapBackground.style.transform = `scale(${scale}) translate(${translateX / scale}px, ${translateY / scale}px)`;
    }
    
    // Initialize cursor
    heatmap.style.cursor = 'grab';
    
    // Setup time-based data visualization
    setupTimeBasedVisualization();
}

// Update heatmap data (simulated)
function updateHeatmapData() {
    const hotspots = document.querySelectorAll('.hotspot');
    
    hotspots.forEach(hotspot => {
        // Generate random data
        const density = ['低', '中', '高'][Math.floor(Math.random() * 3)];
        const count = Math.floor(Math.random() * 200) + 50;
        const isVehicle = hotspot.getAttribute('data-location').includes('停车场');
        const countText = isVehicle ? `${count}辆` : `${count}人`;
        
        // Update data attributes
        hotspot.setAttribute('data-density', density);
        hotspot.setAttribute('data-count', countText);
        
        // Update info display
        const infoElement = hotspot.querySelector('.hotspot-info');
        if (infoElement) {
            const densityType = isVehicle ? '车辆密度' : '人流密度';
            const countType = isVehicle ? '当前车辆' : '当前人数';
            
            infoElement.innerHTML = `
                <h4>${hotspot.getAttribute('data-location')}</h4>
                <p>${densityType}: ${density}</p>
                <p>${countType}: ${countText}</p>
                <p>状态: ${getStatusFromDensity(density, isVehicle)}</p>
            `;
        }
        
        // Update visual appearance based on density
        hotspot.style.animation = density === '高' ? 'pulse 1s infinite' : 'pulse 3s infinite';
        
        if (density === '高') {
            hotspot.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
            hotspot.style.boxShadow = '0 0 15px rgba(255, 0, 0, 0.8)';
        } else if (density === '中') {
            hotspot.style.backgroundColor = 'rgba(255, 165, 0, 0.7)';
            hotspot.style.boxShadow = '0 0 12px rgba(255, 165, 0, 0.7)';
        } else {
            hotspot.style.backgroundColor = 'rgba(255, 255, 0, 0.6)';
            hotspot.style.boxShadow = '0 0 10px rgba(255, 255, 0, 0.6)';
        }
    });
    
    // Update heatmap overlay
    updateHeatmapOverlay();
}

// Get status text based on density
function getStatusFromDensity(density, isVehicle) {
    if (isVehicle) {
        switch(density) {
            case '高': return '车辆密集';
            case '中': return '车流正常';
            case '低': return '车辆稀少';
            default: return '正常';
        }
    } else {
        switch(density) {
            case '高': return '人流密集';
            case '中': return '人流正常';
            case '低': return '人流稀少';
            default: return '正常';
        }
    }
}

// Update heatmap overlay based on hotspot data
function updateHeatmapOverlay() {
    const heatmapOverlay = document.querySelector('.heatmap-overlay');
    if (!heatmapOverlay) return;
    
    // Create dynamic gradient based on hotspot positions
    const hotspots = document.querySelectorAll('.hotspot');
    let gradients = '';
    
    hotspots.forEach((hotspot, index) => {
        const rect = hotspot.getBoundingClientRect();
        const heatmapRect = document.querySelector('.heatmap').getBoundingClientRect();
        
        const x = ((rect.left + rect.width/2) - heatmapRect.left) / heatmapRect.width * 100;
        const y = ((rect.top + rect.height/2) - heatmapRect.top) / heatmapRect.height * 100;
        
        const density = hotspot.getAttribute('data-density');
        let color, size;
        
        switch(density) {
            case '高':
                color = 'rgba(255, 0, 0, 0.4)';
                size = '70%';
                break;
            case '中':
                color = 'rgba(255, 165, 0, 0.3)';
                size = '50%';
                break;
            default:
                color = 'rgba(255, 255, 0, 0.2)';
                size = '30%';
        }
        
        gradients += `radial-gradient(circle at ${x}% ${y}%, ${color} 0%, rgba(255, 165, 0, 0.2) ${size}, transparent 100%)${index < hotspots.length - 1 ? ',' : ''}`;
    });
    
    heatmapOverlay.style.background = gradients;
}

// Setup time-based visualization
function setupTimeBasedVisualization() {
    const timeButtons = document.querySelectorAll('.date-range button');
    if (!timeButtons.length) return;
    
    timeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active state
            timeButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Update heatmap based on selected time range
            const timeRange = this.textContent.trim();
            showNotification(`正在加载${timeRange}数据...`, 'info');
            
            setTimeout(() => {
                updateHeatmapData();
                showNotification(`已更新为${timeRange}热力图数据`, 'success');
            }, 1000);
        });
    });
}

// Format time for display
function formatTime(date) {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) {
        return `${diff}秒前`;
    } else if (diff < 3600) {
        return `${Math.floor(diff / 60)}分钟前`;
    } else if (diff < 86400) {
        return `${Math.floor(diff / 3600)}小时前`;
    } else {
        return date.toLocaleString();
    }
}

// Setup camera feed interactions
function setupCameraFeeds() {
    const cameraFeeds = document.querySelectorAll('.camera-feed');
    
    cameraFeeds.forEach(feed => {
        // Fullscreen button
        const fullscreenBtn = document.createElement('button');
        fullscreenBtn.className = 'camera-fullscreen-btn';
        fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
        feed.appendChild(fullscreenBtn);
        
        fullscreenBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleFullscreen(feed);
        });
        
        // Add play functionality for videos
        const video = feed.querySelector('video');
        const pipVideo = feed.querySelector('.picture-in-picture video');
        
        if (video) {
            // 确保视频可见
            video.style.display = 'block';
            
            // 处理视频加载
            video.addEventListener('loadeddata', function() {
                console.log('视频已加载:', video.src);
                showNotification('视频已加载', 'success');
                
                // 确保视频开始播放
                video.play().catch(err => {
                    console.warn('自动播放失败，可能需要用户交互:', err);
                });
                
                // 同步画中画视频
                if (pipVideo) {
                    pipVideo.currentTime = video.currentTime;
                }
            });
            
            // 处理视频错误
            video.addEventListener('error', function(e) {
                console.error('视频加载错误:', e);
                showNotification('视频加载失败，请检查文件路径', 'error');
                
                // 显示错误信息在视频区域
                const errorOverlay = document.createElement('div');
                errorOverlay.className = 'error-overlay';
                errorOverlay.innerHTML = `
                    <div class="error-message">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>视频加载失败</p>
                        <button class="retry-btn">重试</button>
                    </div>
                `;
                feed.appendChild(errorOverlay);
                
                // 重试按钮
                const retryBtn = errorOverlay.querySelector('.retry-btn');
                retryBtn.addEventListener('click', function() {
                    errorOverlay.remove();
                    // 重新设置视频源以触发重新加载
                    const source = video.querySelector('source');
                    if (source) {
                        const currentSrc = source.src;
                        source.src = '';
                        setTimeout(() => {
                            source.src = currentSrc;
                            video.load();
                        }, 100);
                    } else {
                        video.load();
                    }
                });
            });
            
            // 尝试手动加载视频
            video.load();
            
            // 确保视频不会暂停
            video.addEventListener('pause', function() {
                // 如果视频暂停了，立即恢复播放
                video.play().catch(err => console.warn('恢复播放失败:', err));
            });
            
            // 同步主视频和画中画视频
            if (pipVideo) {
                video.addEventListener('timeupdate', function() {
                    // 只有当时间差异大于0.5秒时才同步，避免频繁更新
                    if (Math.abs(pipVideo.currentTime - video.currentTime) > 0.5) {
                        pipVideo.currentTime = video.currentTime;
                    }
                });
            }
        }
        
        // Simulate motion detection
        setInterval(() => {
            if (Math.random() > 0.7) { // 30% chance of motion detection
                // We're removing the motion detection animation completely
                // No need to create or append any overlay elements
                
                // Just log the detection for debugging purposes
                console.log('Motion detected in camera feed', feed.getAttribute('data-id'));
                
                // Optionally show a notification instead of the red box animation
                const cameraTitle = feed.getAttribute('data-title') || '监控点';
                showNotification(`检测到 ${cameraTitle} 有动态`, 'warning');
            }
        }, 10000); // Check every 10 seconds
    });
}

// 全屏切换功能
function toggleFullscreen(element) {
    if (!document.fullscreenElement) {
        element.requestFullscreen().catch(err => {
            console.error(`全屏错误: ${err.message}`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

// 显示通知函数
function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 显示通知
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // 自动关闭
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Setup view switching between grid and list views
function setupViewSwitching() {
    const gridViewBtn = document.getElementById('grid-view-btn');
    const listViewBtn = document.getElementById('list-view-btn');
    const monitoringContainer = document.querySelector('.monitoring-container');
    
    if (!gridViewBtn || !listViewBtn || !monitoringContainer) return;
    
    // Set initial view based on active button
    if (gridViewBtn.classList.contains('active')) {
        monitoringContainer.classList.add('grid-view');
    } else {
        monitoringContainer.classList.remove('grid-view');
    }
    
    // Grid view button click handler
    gridViewBtn.addEventListener('click', function() {
        if (!this.classList.contains('active')) {
            this.classList.add('active');
            listViewBtn.classList.remove('active');
            monitoringContainer.classList.add('grid-view');
            showNotification('已切换到网格视图', 'info');
            
            // Save preference to localStorage
            localStorage.setItem('monitoringViewPreference', 'grid');
        }
    });
    
    // List view button click handler
    listViewBtn.addEventListener('click', function() {
        if (!this.classList.contains('active')) {
            this.classList.add('active');
            gridViewBtn.classList.remove('active');
            monitoringContainer.classList.remove('grid-view');
            showNotification('已切换到列表视图', 'info');
            
            // Save preference to localStorage
            localStorage.setItem('monitoringViewPreference', 'list');
        }
    });
    
    // Load user preference from localStorage if available
    const savedViewPreference = localStorage.getItem('monitoringViewPreference');
    if (savedViewPreference === 'grid') {
        gridViewBtn.click();
    } else if (savedViewPreference === 'list') {
        listViewBtn.click();
    }
    
    // Add hover effect to camera feeds to show "点击查看详情" message
    const cameraFeeds = document.querySelectorAll('.camera-feed');
    cameraFeeds.forEach(feed => {
        const cameraLink = feed.querySelector('.camera-link');
        if (cameraLink) {
            cameraLink.addEventListener('mouseenter', function() {
                console.log('Hovering camera feed');
            });
            
            cameraLink.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                const locationName = feed.querySelector('.camera-location')?.textContent.trim() || '监控点';
                console.log(`跳转到监控详情页: ${locationName}`);
                
                // We don't prevent default here to allow the link to work
                showNotification(`正在加载 ${locationName} 的详细监控信息...`, 'info');
            });
        }
    });
}

// Setup main video and video list interactions
function setupVideoInteractions() {
    const mainVideo = document.getElementById('main-video');
    const mainVideoTitle = document.getElementById('main-video-title');
    const mainVideoDescription = document.getElementById('main-video-description');
    const mainVideoPeople = document.getElementById('main-video-people');
    const mainVideoAlerts = document.getElementById('main-video-alerts');
    const mainVideoTime = document.getElementById('main-video-time');
    const mainVideoDetailBtn = document.getElementById('main-video-detail-btn');
    const mainVideoFullscreenBtn = document.getElementById('main-video-fullscreen-btn');
    const cameraFeeds = document.querySelectorAll('.camera-feed');
    const cameraDetailBtns = document.querySelectorAll('.camera-detail-btn');
    
    if (!mainVideo || !mainVideoTitle || !mainVideoDescription || !cameraFeeds.length) {
        console.warn('主视频元素或视频列表未找到');
        return;
    }
    
    // 设置主视频详情按钮点击事件
    if (mainVideoDetailBtn) {
        mainVideoDetailBtn.addEventListener('click', function() {
            const activeCamera = document.querySelector('.camera-feed.active');
            if (activeCamera) {
                const cameraId = activeCamera.getAttribute('data-id');
                const cameraTitle = activeCamera.getAttribute('data-title');
                
                // 跳转到详情页
                const detailUrl = `monitor-detail.html?id=${cameraId}&title=${encodeURIComponent(cameraTitle)}`;
                window.location.href = detailUrl;
            }
        });
    }
    
    // 设置列表项详情按钮点击事件
    cameraDetailBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            // 阻止事件冒泡，避免触发列表项的点击事件
            e.stopPropagation();
            
            const cameraId = this.getAttribute('data-id');
            const cameraTitle = this.getAttribute('data-title');
            
            // 跳转到详情页
            const detailUrl = `monitor-detail.html?id=${cameraId}&title=${encodeURIComponent(cameraTitle)}`;
            window.location.href = detailUrl;
            
            showNotification(`正在加载 ${cameraTitle} 的详细监控信息...`, 'info');
        });
    });
    
    // 设置主视频全屏按钮点击事件
    if (mainVideoFullscreenBtn) {
        mainVideoFullscreenBtn.addEventListener('click', function() {
            toggleFullscreen(mainVideo);
        });
    }
    
    // 为每个摄像头卡片添加点击事件
    cameraFeeds.forEach(feed => {
        feed.addEventListener('click', function() {
            // 移除所有卡片的激活状态
            cameraFeeds.forEach(item => item.classList.remove('active'));
            
            // 添加当前卡片的激活状态
            this.classList.add('active');
            
            // 获取当前卡片的数据
            const cameraId = this.getAttribute('data-id');
            const cameraTitle = this.getAttribute('data-title');
            const cameraDescription = this.getAttribute('data-description');
            const cameraPeople = this.getAttribute('data-people');
            const cameraAlerts = this.getAttribute('data-alerts');
            const cameraTime = this.getAttribute('data-time');
            
            // 更新主视频信息
            mainVideoTitle.textContent = cameraTitle;
            mainVideoDescription.textContent = cameraDescription;
            mainVideoPeople.textContent = cameraPeople;
            mainVideoAlerts.textContent = cameraAlerts;
            mainVideoTime.textContent = cameraTime;
            
            // 获取当前卡片的视频源
            const videoSource = this.querySelector('video source');
            if (videoSource) {
                const videoSrc = videoSource.getAttribute('src');
                
                // 更新主视频源
                const mainVideoSource = mainVideo.querySelector('source');
                if (mainVideoSource) {
                    mainVideoSource.setAttribute('src', videoSrc);
                    mainVideo.load();
                    mainVideo.play().catch(err => console.warn('自动播放失败:', err));
                }
            }
            
            // 更新主视频状态
            const statusElement = this.querySelector('.camera-status');
            if (statusElement) {
                const mainVideoStatus = document.querySelector('.main-video-status');
                if (mainVideoStatus) {
                    mainVideoStatus.innerHTML = statusElement.innerHTML;
                }
            }
            
            showNotification(`已切换到 ${cameraTitle} 的监控视频`, 'info');
        });
    });
    
    // 初始化主视频（使用第一个激活的摄像头）
    const activeCamera = document.querySelector('.camera-feed.active');
    if (activeCamera) {
        // 模拟点击第一个激活的摄像头
        activeCamera.click();
    }
} 