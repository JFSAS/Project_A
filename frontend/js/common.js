// Common JavaScript functions for all pages

// Set active navigation link based on current page
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref === currentPage || 
            (currentPage === '' && linkHref === 'index.html') || 
            (currentPage === 'situation.html' && linkHref === 'index.html')) {
            link.classList.add('active');
        }
    });
});

// Format date to readable string
function formatDate(date) {
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    };
    return new Date(date).toLocaleDateString('zh-CN', options);
}

// Format time to readable string
function formatTime(date) {
    const options = { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
    };
    return new Date(date).toLocaleTimeString('zh-CN', options);
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="notification-icon"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    // Add animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Auto close after 5 seconds
    setTimeout(() => {
        closeNotification(notification);
    }, 5000);
    
    // Close button event
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        closeNotification(notification);
    });
}

// Close notification
function closeNotification(notification) {
    notification.classList.remove('show');
    setTimeout(() => {
        notification.remove();
    }, 300);
}

// Toggle fullscreen
function toggleFullscreen(element) {
    if (!document.fullscreenElement) {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
} 