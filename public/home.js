document.addEventListener("DOMContentLoaded", function() {
    const buttons = document.querySelectorAll(".btn");

    buttons.forEach(button => {
        button.addEventListener("click", function(event) {
            const choice = confirm(`Are you sure you want to ${button.textContent}?`);
            if (!choice) {
                event.preventDefault(); // Prevent navigation if the user cancels
            }
        });
    });
});
