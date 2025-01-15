document.addEventListener("DOMContentLoaded", function() {
    // Define the base URL for the API
    const BASE_URL = "http://127.0.0.1:5000";

    // Google login button handler
    document.getElementById("google-login").addEventListener("click", function () {
        window.location.href = `${BASE_URL}/google/login`;
    });

    // Helper function to get a specific cookie value by name
    function getCookieByName(name) {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            cookie = cookie.trim(); // Remove leading/trailing spaces
            if (cookie.startsWith(name + '=')) {
                return cookie.substring(name.length + 1); // Return the cookie value
            }
        }
        return null; // Return null if the cookie is not found
    }

    // Helper function to get URL parameters (for the authorization code)
    function getUrlParameter(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        const results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }

    // Check if it's a Google callback (by checking for the "code" parameter in the URL)
    const code = getUrlParameter('code');
    if (code) {
        // Exchange the authorization code for tokens
        fetch(`${BASE_URL}/google/login/callback${location.search}`, {
            method: 'GET',
        })
        .then(response => response.json()) // Parse the JSON response
        .then(data => {
            if (data.access_token) {
                // Store the access token in localStorage
                localStorage.setItem('token', data.access_token);
                // Redirect the user to the adoption page
                window.location.href = 'http://127.0.0.1:5500/public/pages/adoption.html';
            } else {
                throw new Error(data.message || 'Login failed');
            }
        })
        .catch(error => {
            console.error('Login error:', error);
            alert('Login failed: ' + error.message);
            window.location.href = '/'; // Redirect to home page or login page
        });
    }

    // Function to check email or password length
    function checkLength(e) {
        if (e.length < 3) {
            window.alert("Email or password is too short.");
            return false;
        }
        return true;
    }

    // Form submission handler
    const form = document.querySelector('form');
    form.addEventListener('submit', function(event) {
        event.preventDefault(); 

        let email = document.getElementsByName("email")[0].value;
        let password = document.getElementsByName("password")[0].value;

        if (!checkLength(email) || !checkLength(password)) {
            return;
        }

        // Login request to backend
        fetch(`${BASE_URL}/api/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: email, password: password })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            return response.json();
        })
        .then(data => {
            if (data.access_token) {  // Ensure token is returned
                localStorage.setItem('token', data.access_token);
                localStorage.setItem("id", data.user_id);
                localStorage.setItem("img",data.image)
                
                window.location.href = 'adoption.html';  // Redirect to another page
            } else {
                throw new Error("Token not received.");
            }
        })
        .catch(error => {
            window.alert("Login failed: " + error.message);
        });
    });
});
