// Confetti setup
const confettiSettings = { 
  particleCount: 100,
  spread: 70,
  origin: { y: 0.6 },
  colors: ['#ff2a6d', '#d300c5', '#01cdfe']
};

// DOM Elements
const confessionForm = document.getElementById('confession-form');
const confessionInput = document.getElementById('confession-text');
const charCount = document.getElementById('char-count');
const submitBtn = document.getElementById('submit-btn');
const statusEl = document.getElementById('status-message');
const reactionBtns = document.querySelectorAll('.reaction-btn');
const reactionCounts = document.querySelectorAll('.reaction-count');
const modal = document.getElementById('success-modal');
const closeModalBtn = document.querySelector('.close-modal');

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  // Initialize character counter
  updateCharCount();
  
  // Initialize typing animation
  typeWriter();
  
  // Initialize matrix rain
  createMatrixRain();
});

// Character counter
function updateCharCount() {
  const remaining = 500 - confessionInput.value.length;
  charCount.textContent = `${remaining} characters left`;
  charCount.className = remaining < 50 ? 'text-red-500' : 'text-gray-400';
}

confessionInput.addEventListener('input', updateCharCount);

// Handle form submission
confessionForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = confessionInput.value.trim();
  
  // Validate input
  if (text.length < 10) {
    showStatus('Confession must be at least 10 characters', 'error');
    return;
  }
  
  if (text.length > 500) {
    showStatus('Confession must be less than 500 characters', 'error');
    return;
  }
  
  try {
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Posting...';
    
    // Check if we're in development or production
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const apiUrl = isLocal 
      ? 'http://localhost:8888/.netlify/functions/confess'
      : '/.netlify/functions/confess';
        // Reset form
        confessionForm.reset();
        charCount.textContent = '0';
        
    } catch (error) {
        console.error('Error:', error);
        showMessage(`Failed to post: ${error.message}`, 'error');
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        btnText.textContent = 'POST ANONYMOUSLY';
        spinner.style.display = 'none';
    }
});

// Show message function
function showMessage(message, type = 'info') {
    // Remove any existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;
    
    // Add styles
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '20px';
    messageDiv.style.left = '50%';
    messageDiv.style.transform = 'translateX(-50%)';
    messageDiv.style.padding = '15px 25px';
    messageDiv.style.borderRadius = '5px';
    messageDiv.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
    messageDiv.style.zIndex = '1000';
    messageDiv.style.animation = 'slideIn 0.3s ease-out';
    messageDiv.style.fontWeight = 'bold';
    
    // Style based on type
    if (type === 'success') {
        messageDiv.style.backgroundColor = '#4CAF50';
        messageDiv.style.color = 'white';
    } else if (type === 'error') {
        messageDiv.style.backgroundColor = '#f44336';
        messageDiv.style.color = 'white';
    } else {
        messageDiv.style.backgroundColor = '#2196F3';
        messageDiv.style.color = 'white';
    }
    
    document.body.appendChild(messageDiv);
    
    // Remove after 5 seconds
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            if (messageDiv.parentNode) {
                document.body.removeChild(messageDiv);
            }
        }, 300);
    }, 5000);
}

// Show confetti effect
function showConfetti() {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff2a6d', '#d300c5', '#01cdfe']
    });
}

// Add animations to style
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translate(-50%, -50px); opacity: 0; }
        to { transform: translate(-50%, 0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translate(-50%, 0); opacity: 1; }
        to { transform: translate(-50%, -50px); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize typing effect on load
document.addEventListener('DOMContentLoaded', () => {
    const title = document.querySelector('h1');
    const titleText = title.textContent;
    typeWriter(title, titleText, 150);
    
    // Add matrix rain effect
    createMatrixRain();
});

// Matrix rain effect
function createMatrixRain() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const matrixRain = document.querySelector('.matrix-rain');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    matrixRain.appendChild(canvas);
    
    const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
    const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nums = '0123456789';
    const alphabet = katakana + latin + nums;
    
    const fontSize = 16;
    const columns = canvas.width / fontSize;
    
    const rainDrops = Array(Math.floor(columns)).fill(1);
    
    function draw() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#0F0';
        ctx.font = `${fontSize}px monospace`;
        
        for (let i = 0; i < rainDrops.length; i++) {
            const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
            ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);
            
            if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                rainDrops[i] = 0;
            }
            rainDrops[i]++;
        }
    }
    
    setInterval(draw, 30);
    
    // Handle window resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// Add service worker for offline support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
            console.log('ServiceWorker registration successful');
        }).catch(err => {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}
