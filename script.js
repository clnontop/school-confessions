// DOM Elements
const confessionForm = document.querySelector('.confession-box');
const confessionText = document.getElementById('confessionText');
const submitBtn = document.getElementById('submitBtn');
const charCount = document.getElementById('charCount');
const successModal = document.getElementById('successModal');
const closeModal = document.querySelector('.close');
const reactions = document.querySelectorAll('.reaction');

// Initialize particles.js
particlesJS('particles-js', {
    particles: {
        number: { value: 80, density: { enable: true, value_area: 800 } },
        color: { value: "#ffffff" },
        shape: { type: "circle" },
        opacity: {
            value: 0.5,
            random: true,
            anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false }
        },
        size: {
            value: 3,
            random: true,
            anim: { enable: true, speed: 2, size_min: 0.1, sync: false }
        },
        line_linked: {
            enable: true,
            distance: 150,
            color: "#ff2a6d",
            opacity: 0.2,
            width: 1
        },
        move: {
            enable: true,
            speed: 1,
            direction: "none",
            random: true,
            straight: false,
            out_mode: "out",
            bounce: false
        }
    },
    interactivity: {
        detect_on: "canvas",
        events: {
            onhover: { enable: true, mode: "repulse" },
            onclick: { enable: true, mode: "push" },
            resize: true
        }
    },
    retina_detect: true
});

// Typing effect for title
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.textContent = '';
    element.classList.add('typing');
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        } else {
            element.classList.remove('typing');
        }
    }
    
    type();
}

// Character counter
confessionText.addEventListener('input', () => {
    const currentLength = confessionText.value.length;
    charCount.textContent = currentLength;
    
    // Update character count color based on length
    if (currentLength > 450) {
        charCount.style.color = '#ff2a6d';
    } else if (currentLength > 400) {
        charCount.style.color = '#ff9a5a';
    } else {
        charCount.style.color = 'rgba(255, 255, 255, 0.6)';
    }
});

// Reaction counter
reactions.forEach(reaction => {
    reaction.addEventListener('click', () => {
        const count = parseInt(reaction.textContent) + 1;
        reaction.textContent = count;
        reaction.innerHTML = `${reaction.dataset.emoji} ${count}`;
        
        // Add animation
        reaction.style.transform = 'scale(1.1)';
        setTimeout(() => {
            reaction.style.transform = 'scale(1)';
        }, 200);
    });
});

// Modal functions
function showModal() {
    successModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Trigger confetti
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff2a6d', '#d300c5', '#01cdfe']
    });
    
    // Auto-close after 5 seconds
    setTimeout(() => {
        closeModal.click();
    }, 5000);
}

function closeModalHandler() {
    successModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

closeModal.addEventListener('click', closeModalHandler);

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === successModal) {
        closeModalHandler();
    }
});

// Form submission
confessionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const confession = confessionText.value.trim();
    
    // Validation
    if (confession.length < 10) {
        alert('Confession must be at least 10 characters long!');
        return;
    }
    
    if (confession.length > 500) {
        alert('Confession must be less than 500 characters!');
        return;
    }
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    
    try {
        // Check if we're in development or production
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const apiUrl = isLocal 
            ? 'http://localhost:8888/.netlify/functions/confess' 
            : '/.netlify/functions/confess';
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: confession })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            // Show success modal
            showModal();
            // Reset form
            confessionForm.reset();
            charCount.textContent = '0';
        } else {
            throw new Error(result.error || 'Failed to post confession');
        }
    } catch (error) {
        console.error('Error:', error);
        alert(`Failed to post confession: ${error.message}`);
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
    }
});

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
