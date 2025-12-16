// Confetti setup
const confettiSettings = { 
  particleCount: 100,
  spread: 70,
  origin: { y: 0.6 },
  colors: ['#ff2a6d', '#d300c5', '#01cdfe']
};

// DOM Elements
console.log('Initializing script...');
let confessionForm = document.getElementById('confessionForm');
let confessionInput = document.getElementById('confessionText');
let charCount = document.getElementById('charCount');
let submitBtn = document.getElementById('submitBtn');
const modal = document.getElementById('successModal');
const closeModalBtn = document.querySelector('.close');
const reactionElements = document.querySelectorAll('.reaction');

// Debug: Log all found elements
console.log('Form:', confessionForm);
console.log('Input:', confessionInput);
console.log('Submit Button:', submitBtn);

// Add form event listener if form exists
if (confessionForm) {
  console.log('Form found, adding submit event listener');
  confessionForm.addEventListener('submit', function(e) {
    console.log('Form submit event triggered');
    handleFormSubmit(e);
  });
} else {
  console.error('Form element not found!');
}

if (confessionInput) {
  confessionInput.addEventListener('input', updateCharCount);
}

// Add click event for close button
if (closeModalBtn) {
  closeModalBtn.addEventListener('click', closeModal);
}

// Add click event for reactions
reactionElements.forEach(reaction => {
  reaction.addEventListener('click', () => {
    let count = parseInt(reaction.textContent) || 0;
    reaction.textContent = count + 1;
    reaction.classList.add('animate-bounce');
    setTimeout(() => reaction.classList.remove('animate-bounce'), 1000);
  });
});

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  // Initialize character counter
  if (confessionInput && charCount) {
    updateCharCount();
  }
  
  // Initialize typing animation
  typeWriter();
  
  // Initialize matrix rain
  createMatrixRain();
  
  // Add click outside modal to close
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
});

// Character counter
function updateCharCount() {
  if (!confessionInput || !charCount) return;
  
  const remaining = 500 - confessionInput.value.length;
  charCount.textContent = remaining;
  charCount.className = remaining < 50 ? 'text-red-500' : 'text-gray-400';
}

// Handle form submission
async function handleFormSubmit(e) {
  console.log('handleFormSubmit called');
  e.preventDefault();
  
  if (!confessionInput || !submitBtn) {
    console.error('Missing required elements:', { confessionInput, submitBtn });
    return;
  }
  
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
    const btnText = submitBtn.querySelector('.btn-text');
    const spinner = submitBtn.querySelector('.spinner');
    
    if (btnText) btnText.textContent = 'Posting...';
    if (spinner) spinner.style.display = 'inline-block';
    
    // Check if we're in development or production
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const apiUrl = isLocal 
      ? 'http://localhost:8888/.netlify/functions/confess'
      : '/.netlify/functions/confess';
    
    // Send to Netlify function
    console.log('Sending request to:', apiUrl, 'with text:', text);
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ text })
      });
      
      console.log('Response status:', response.status);
      const data = await response.json().catch(e => ({}));
      console.log('Response data:', data);
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      throw new Error(data.error || 'Failed to post confession');
    }
    
    // Success
    showStatus('Confession posted successfully! 🎉', 'success');
    showConfetti();
    
    // Reset form
    if (confessionForm) confessionForm.reset();
    if (charCount) charCount.textContent = '0';
    
    // Show success modal
    openModal();
    
  } catch (error) {
    console.error('Error in form submission:', error);
    const errorMessage = error.message || 'Failed to post confession. Please try again.';
    console.error('Error details:', errorMessage);
    showStatus(errorMessage, 'error');
  } finally {
    // Reset button state
    if (submitBtn) {
      submitBtn.disabled = false;
      const btnText = submitBtn.querySelector('.btn-text');
      const spinner = submitBtn.querySelector('.spinner');
      if (btnText) btnText.textContent = 'POST ANONYMOUSLY';
      if (spinner) spinner.style.display = 'none';
    }
  }
}

// Show message function
function showStatus(message, type = 'info') {
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
    messageDiv.style.whiteSpace = 'nowrap';
    
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

// Modal functions
function openModal() {
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal() {
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
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
    
    .spinner {
        display: none;
        margin-left: 8px;
    }
    
    .message {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 12px 24px;
        border-radius: 4px;
        color: white;
        font-weight: bold;
        z-index: 1000;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease-out;
    }
    
    .message-success {
        background-color: #4CAF50;
    }
    
    .message-error {
        background-color: #f44336;
    }
`;
document.head.appendChild(style);

// Typing effect
function typeWriter() {
    const title = document.querySelector('h1');
    if (!title) return;
    
    const text = title.textContent;
    title.textContent = '';
    
    let i = 0;
    const speed = 100; // milliseconds per character
    
    function type() {
        if (i < text.length) {
            title.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Reaction buttons functionality is now at the top of the file

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
