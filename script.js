// Configuration
const TYPING_SPEED = 100;
const BACKSPACE_SPEED = 50;
const CURSOR_BLINK_INTERVAL = 530; // milliseconds
const BLOCK_CURSOR = '❚';
const PIPE_CURSOR = '|';
const CONTINUOUS_LOOP = true;  // Set to false to stop after last word

// Typing animation strings
const TYPING_STRINGS = [
    'sieve',
    'sieve AI',
    // 'sieve agents',
    'sieve data',
];

function getCommonPrefix(str1, str2) {
    let i = 0;
    while (i < str1.length && i < str2.length && str1[i] === str2[i]) {
        i++;
    }
    return str1.slice(0, i);
}

document.addEventListener('DOMContentLoaded', function() {
    // Set video playback speed
    const video = document.querySelector('.video-background');
    if (video) {
        // Get the speed from CSS variable
        const speed = getComputedStyle(document.documentElement)
            .getPropertyValue('--video-playback-speed')
            .trim();
        video.playbackRate = parseFloat(speed);
    }

    const textElement = document.getElementById('typed-text');
    let currentStringIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;
    let cursorVisible = true;
    let isTyping = false;  // Track if we're actively typing
    
    // Function to get current text without cursor
    const getCurrentText = () => {
        return textElement.textContent.replace(BLOCK_CURSOR, '').replace(PIPE_CURSOR, '');
    };

    // Function to update text with cursor
    const updateText = (text, showCursor, isTypingCursor = false) => {
        const cursor = isTypingCursor ? BLOCK_CURSOR : PIPE_CURSOR;
        textElement.textContent = text + (showCursor ? cursor : '');
    };

    // Handle cursor blinking
    setInterval(() => {
        if (!isTyping) {  // Only blink when not typing
            cursorVisible = !cursorVisible;
            updateText(getCurrentText(), cursorVisible, false);
        }
    }, CURSOR_BLINK_INTERVAL);

    // Main typing function
    function typeText() {
        const currentString = TYPING_STRINGS[currentStringIndex];
        const currentText = getCurrentText();

        if (isDeleting) {
            isTyping = true;
            const nextString = TYPING_STRINGS[(currentStringIndex + 1) % TYPING_STRINGS.length];
            const commonPrefix = getCommonPrefix(currentText, nextString);
            
            // If we've reached the common prefix (or there isn't one), proceed normally
            if (currentText.length > commonPrefix.length) {
                updateText(currentText.slice(0, -1), true, true);
                setTimeout(typeText, BACKSPACE_SPEED);
            } else {
                isDeleting = false;
                if (CONTINUOUS_LOOP || currentStringIndex < TYPING_STRINGS.length - 1) {
                    currentStringIndex = (currentStringIndex + 1) % TYPING_STRINGS.length;
                    isTyping = false;
                    setTimeout(typeText, 500); // Pause before typing next string
                } else {
                    isTyping = false;
                }
            }
        } else {
            // Typing text
            if (currentText.length < currentString.length) {
                isTyping = true;
                updateText(currentString.slice(0, currentText.length + 1), true, true);
                setTimeout(typeText, TYPING_SPEED);
            } else {
                // Finished typing current string
                isTyping = false;
                if (CONTINUOUS_LOOP || currentStringIndex < TYPING_STRINGS.length - 1) {
                    setTimeout(() => {
                        isDeleting = true;
                        typeText();
                    }, 1500); // Pause before starting to delete
                }
            }
        }
    }

    // Start the typing animation
    setTimeout(typeText, 500);

    initializeSlideshow();
    // Add keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') moveSlide(-1);
        if (e.key === 'ArrowRight') moveSlide(1);
    });

    // Handle form submission
    const form = document.querySelector('form');
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        try {
            const formData = new FormData(form);
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                // Success state
                submitButton.classList.remove('chrome-button');
                submitButton.classList.add('success-button');
                submitButton.textContent = "Message received - we'll reach out to you soon!";
                form.reset();

                // Reset button after 5 seconds
                setTimeout(() => {
                    submitButton.classList.remove('success-button');
                    submitButton.classList.add('chrome-button');
                    submitButton.textContent = originalButtonText;
                }, 5000);
            } else {
                throw new Error('Submission failed');
            }
        } catch (error) {
            console.error('Error:', error);
            submitButton.textContent = "Error sending message. Please try again.";
            submitButton.classList.add('error-state');

            // Reset button after 3 seconds
            setTimeout(() => {
                submitButton.classList.remove('error-state');
                submitButton.textContent = originalButtonText;
            }, 3000);
        }
    });

    // Add click handlers to usecase cards
    const usecaseCards = document.querySelectorAll('.usecase-card');
    usecaseCards.forEach(card => {
        card.addEventListener('click', () => {
            // Make the card clickable
            card.style.cursor = 'pointer';
            
            // Scroll to data options section
            document.getElementById('data-options').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });

        // Add hover effect to indicate clickability
        card.addEventListener('mouseenter', () => {
            card.style.cursor = 'pointer';
        });
    });
}); 


// Slideshow configuration
const SLIDES = [
    'screenshot1.png',
    'screenshot2.png',
    'screenshot3.png'
];

let currentSlideIndex = 0;
let slideInterval;

// Initialize slideshow
function initializeSlideshow() {
    console.log('Initializing slideshow...');
    const container = document.querySelector('.slideshow-container');
    const indicators = document.getElementById('slide-indicators');
    console.log('Slideshow container:', container);
    
    if (!container) {
        console.error('Could not find slideshow container');
        return;
    }
    // Test creating and appending a single image first
    const testSlide = document.createElement('div');
    testSlide.className = 'absolute w-full h-full';
    
    const testImg = document.createElement('img');
    testImg.src = 'images/screenshot1.png';
    testImg.alt = 'Test Screenshot';
    testImg.className = 'w-full h-full object-contain bg-gray-900';
    testImg.onerror = () => console.error('Failed to load image:', testImg.src);
    testImg.onload = () => console.log('Successfully loaded image:', testImg.src);
    
    testSlide.appendChild(testImg);
    container.appendChild(testSlide);
    
    console.log('Test slide added to container');
    
    // Create slides
    SLIDES.forEach((slide, index) => {
        const slideDiv = document.createElement('div');
        slideDiv.className = `absolute w-full h-full transition-transform duration-500 ${
            index === 0 ? 'translate-x-0' : 'translate-x-full'
        }`;
        
        const img = document.createElement('img');
        img.src = `images/${slide}`;
        img.alt = `Product Screenshot ${index + 1}`;
        img.className = 'w-full h-full object-contain bg-gray-900';
        
        slideDiv.appendChild(img);
        container.appendChild(slideDiv);

        // Create indicator dot
        const indicator = document.createElement('button');
        indicator.className = `w-2 h-2 rounded-full transition-colors ${
            index === 0 ? 'bg-white' : 'bg-white/50'
        }`;
        indicator.onclick = () => goToSlide(index);
        indicators.appendChild(indicator);
    });

    // Handle visibility
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                const section = entry.target;
                if (entry.isIntersecting) {
                    section.classList.remove('opacity-0');
                    section.classList.add('opacity-100');
                    startSlideshow();
                } else {
                    section.classList.remove('opacity-100');
                    section.classList.add('opacity-0');
                    stopSlideshow();
                }
            });
        },
        { threshold: 0.1 }
    );

    const slideshowSection = document.getElementById('slideshow-section');
    if (slideshowSection) {
        observer.observe(slideshowSection);
    }
}

function moveSlide(direction) {
    goToSlide(currentSlideIndex + direction);
}

function goToSlide(index) {
    const slides = document.querySelectorAll('.slideshow-container > div');
    const indicators = document.querySelectorAll('#slide-indicators > button');
    
    if (index >= slides.length) index = 0;
    if (index < 0) index = slides.length - 1;

    const offset = currentSlideIndex - index;
    
    slides.forEach((slide, i) => {
        if (i === index) {
            slide.style.transform = 'translateX(0)';
        } else if (i < index) {
            slide.style.transform = 'translateX(-100%)';
        } else {
            slide.style.transform = 'translateX(100%)';
        }
    });

    indicators.forEach((dot, i) => {
        if (i === index) {
            dot.classList.remove('bg-white/50');
            dot.classList.add('bg-white');
        } else {
            dot.classList.remove('bg-white');
            dot.classList.add('bg-white/50');
        }
    });

    currentSlideIndex = index;
    resetSlideInterval();
}

function startSlideshow() {
    slideInterval = setInterval(() => {
        moveSlide(1);
    }, 5000);
}

function stopSlideshow() {
    clearInterval(slideInterval);
}

function resetSlideInterval() {
    stopSlideshow();
    startSlideshow();
}