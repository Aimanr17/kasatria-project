// Get the environment variables using Vite's import.meta.env
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
console.log('Environment loaded, client ID:', GOOGLE_CLIENT_ID);

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

    console.log('Initializing Google Sign-In...');
    try {
        google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse
        });
        google.accounts.id.renderButton(
            document.getElementById("buttonDiv"),
            { 
                theme: "filled_blue",
                size: "large",
                text: "continue_with",
                shape: "rectangular",
                logo_alignment: "left",
                width: 300
            }
        );
        google.accounts.id.prompt();
        console.log('Google Sign-In initialized successfully');
    } catch (error) {
        console.error('Error initializing Google Sign-In:', error);
    }
}

// Make handleCredentialResponse global
window.handleCredentialResponse = function(response) {
    console.log("Encoded JWT ID token: " + response.credential);
    
    const responsePayload = decodeJwtResponse(response.credential);
    console.log("Decoded response:", responsePayload);

    // Store user info in localStorage
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', responsePayload.email);
    localStorage.setItem('userName', responsePayload.name);
    localStorage.setItem('userPicture', responsePayload.picture);
    
    console.log('Login successful, redirecting...');
    window.location.href = '../index.html';
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    if (localStorage.getItem('isLoggedIn') === 'true') {
        window.location.href = '../index.html';
        return;
    }

    // Initialize Google Sign-In
    if (window.google) {
        initializeGoogleSignIn();
    } else {
        // If Google API isn't loaded yet, wait for it
        window.onload = initializeGoogleSignIn;
    }

    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    // Hardcoded credentials (in real app, this should be server-side)
    const validCredentials = {
        username: 'admin',
        password: '123'
    };

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (username === validCredentials.username && password === validCredentials.password) {
            // Login successful
            localStorage.setItem('isLoggedIn', 'true');
            window.location.href = '../index.html';
        } else {
            // Show error message
            errorMessage.style.display = 'block';
            setTimeout(() => {
                errorMessage.style.display = 'none';
            }, 3000);
        }
    });
});