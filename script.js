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
    'sieve agents',
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
    //Demo signup button scrolling
    document.querySelector('.btn.btn-secondary').addEventListener('click', function () {
    document.getElementById('api_signup_title').scrollIntoView({ behavior: 'smooth' });
    });

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


    // Handle contact us form submission
    const form = document.getElementById('contact');
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

    //Use case cards
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

    //API form account creation

    document.getElementById("api_signup").addEventListener("submit", async function(event) {
        event.preventDefault(); // Prevent form from refreshing the page
        
        // Get user input values
        const fullName = document.getElementById("full_name").value;
        const email = document.getElementById("api_email").value;
        const password = document.getElementById("password").value;
        const userType = "requester"
        //const responseMessage = document.getElementById("responseMessage");

        // API endpoint (replace with your actual API URL)
        const BASE_URL = "https://api.usesieve.com"; 
        const apiUrl = `${BASE_URL}/api/v1/auth/register`;

        const form = document.getElementById('api_signup');
        const api_button = form.querySelector('button[type="submit"]');
        const originalButtonText = api_button.textContent;

        //Have button show loading state so users do not submit form twice
        api_button.classList.remove('chrome-button');
        api_button.classList.add('loading-button');
        api_button.textContent = "Loading...";
        

        try {
            // Send registration request
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    user_type: userType,
                    full_name: fullName
                })
            });
            const result = await response.json();

            if (response.ok) {
                api_button.classList.remove('chrome-button', 'error-state');
                api_button.classList.add('success-button');
                api_button.textContent = "✅ Registration successful! You may start using our API with your credentials.";
                form.reset();

            } else {
                api_button.classList.remove('chrome-button');
                api_button.classList.add('error-state');
                api_button.textContent = `❌ Error: ${result.detail || "Something went wrong"}`;
                form.reset();
            }
        } catch (error) {
            api_button.classList.remove('chrome-button');
            api_button.classList.add('error-state');
            api_button.textContent = `❌ Error: ${error.message || "Something went wrong"}`;
            form.reset();
        }
    });

}); 



