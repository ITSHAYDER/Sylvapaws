document.addEventListener("DOMContentLoaded", function() {
    function showAlert() {
        // Get the alert container element
        const alertContainer = document.getElementsByClassName('alert')[0];

        // Show the alert
        alertContainer.style.display = 'block';

        setTimeout(() => {
            alertContainer.style.display = 'none';
        }, 100000); 
    }

    let form = document.querySelector("form");
    let name = document.getElementsByName("name")[0];
    let username = document.getElementsByName("username")[0];
    let email = document.getElementsByName("email")[0];
    let password = document.getElementsByName("password")[0];
    
    form.addEventListener("submit", e => {
        e.preventDefault();

        fetch("http://127.0.0.1:5000/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: name.value,
                user_name: username.value,
                email: email.value,
                password: password.value
            })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.message || "Registration failed");
                });
            }
            return response.json();
        })
        .then(data => {

            showAlert();
            window.location.pathname = "client/pages/login.html"
        })
        .catch(error => {
            window.alert(error.message);
        });
    });
});
