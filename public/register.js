document.addEventListener("DOMContentLoaded", function() {
    const registerForm = document.getElementById("register-form");

    registerForm.addEventListener("submit", function(event) {
        event.preventDefault(); // Prevent the default form submission

        const username = document.getElementById("username").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        // Basic validation for username
        if (username === "") {
            alert("Please enter a username.");
            return;
        }

        // Basic email validation using a simple regex pattern
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            alert("Please enter a valid email address.");
            return;
        }

        // Basic validation for password (minimum 6 characters)
        if (password.length < 6) {
            alert("Password must be at least 6 characters long.");
            return;
        }

        // Create an object with the form data
        const formData = {
            username: username,
            email: email,
            password: password
        };

        // Send the form data to the backend using fetch
        fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Registration successful!');
                // Redirect or perform other actions upon successful registration
                window.location.href = '/login';
            } else {
                alert(`Registration failed: ${data.message}`);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred. Please try again later.');
        });
    });
});
