// Get the environment variables using Vite's import.meta.env
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Function to decode JWT token
function decodeJwtResponse(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

// Initialize Google Sign-In
function initializeGoogleSignIn() {
    if (!GOOGLE_CLIENT_ID) {
        console.error('Google Client ID not found in environment variables');
        return;
    }

    try {
        google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true
        });

        const buttonDiv = document.getElementById("buttonDiv");
        if (buttonDiv) {
            google.accounts.id.renderButton(
                buttonDiv,
                { 
                    type: "standard",
                    theme: "filled_blue",
                    size: "large",
                    text: "continue_with",
                    shape: "rectangular",
                    logo_alignment: "left",
                    width: 250
                }
            );
        }
    } catch (error) {
        console.error('Error initializing Google Sign-In:', error);
    }
}

// Handle Google Sign-In response
function handleCredentialResponse(response) {
    try {
        const responsePayload = decodeJwtResponse(response.credential);
        
        // Store user info in localStorage
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', responsePayload.email);
        localStorage.setItem('userName', responsePayload.name);
        localStorage.setItem('userPicture', responsePayload.picture);
        
        // Redirect to main page
        window.location.href = '../index.html';
    } catch (error) {
        console.error('Error handling Google Sign-In response:', error);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    if (localStorage.getItem('isLoggedIn') === 'true') {
        window.location.href = '../index.html';
        return;
    }

    // Initialize Google Sign-In
    if (typeof google !== 'undefined' && google.accounts) {
        initializeGoogleSignIn();
    } else {
        // If Google API isn't loaded yet, wait for it
        window.onload = function() {
            if (typeof google !== 'undefined' && google.accounts) {
                initializeGoogleSignIn();
            }
        };
    }

    // Handle regular login form
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Simple validation (replace with your actual authentication logic)
        if (username === 'admin' && password === '123') {
            localStorage.setItem('isLoggedIn', 'true');
            window.location.href = '../index.html';
        } else {
            alert('Invalid username or password');
        }
    });
});