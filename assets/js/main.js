window.addEventListener('DOMContentLoaded', (event) => {
    const usernameDisplay = document.getElementById('username-display');
    const dropdownMenu = document.getElementById('dropdown-menu');

    // Show the username from localStorage
    const username = localStorage.getItem('username');
    if (username) {
        usernameDisplay.textContent = username;
    }

    // Toggle dropdown menu on click
    usernameDisplay.addEventListener('click', () => {
        dropdownMenu.classList.toggle('show');
    });

    // Close dropdown when clicking outside of it
    window.addEventListener('click', (event) => {
        if (!event.target.closest('#user-info')) {
            dropdownMenu.classList.remove('show');
        }
    });
});
