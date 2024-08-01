const sheetId = '1mle7fv9FiBj2cu7h7LLF-a9JnPbSx-6w1WhjH76CegQ'; // Replace with your sheet ID
const apiKey = 'AIzaSyDr1hKI4jpsDw4_WfVTt81obTNLgIdU6P4'; // Replace with your API key
const UserRANGE = 'USER!A1:H'; // Range for user data
const BranchDetailsRANGE = 'BranchDetails!A1:O'; // Range for locations data

document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('loginForm');
    const message = document.getElementById('message');
    const locationSelect = document.getElementById('location');
    
    // Fetch locations data
    await populateLocations(locationSelect);
    
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        const location = locationSelect.value;

        try {
            const isAuthenticated = await authenticateUser(username, password, location);
            
            if (isAuthenticated) {
                message.textContent = 'Login successful!';
                message.style.color = 'green';
                // Save the username to localStorage
                localStorage.setItem('username', username);
                // Redirect to home.html
                window.location.href = 'home.html';
            } else {
                message.textContent = 'Invalid username, password, or location.';
                message.style.color = 'red';
            }
        } catch (error) {
            message.textContent = 'An error occurred. Please try again later.';
            message.style.color = 'red';
            console.error('Error during authentication:', error);
        }
    });
});

async function authenticateUser(username, password, location) {
    try {
        const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${UserRANGE}?key=${apiKey}`);
        
        if (!response.ok) {
            const errorText = await response.text(); // Get error details
            throw new Error(`Failed to fetch data from Google Sheets: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        
        if (!data.values) {
            throw new Error('No data returned from Google Sheets');
        }
        
        // Assuming the first row contains headers, and data starts from row 2
        const rows = data.values.slice(1);
        
        for (const row of rows) {
            const sheetUsername = row[4]; // Column E (index 4)
            const sheetPassword = row[5]; // Column F (index 5)
            const sheetLocation = row[6]; // Column G (index 6)
            
            if (username === sheetUsername && password === sheetPassword && location === sheetLocation) {
                return true;
            }
        }
        
        return false;
    } catch (error) {
        console.error('Error during authentication:', error.message); // Log error message
        throw error; // Re-throw error for further handling
    }
}

async function populateLocations(locationSelect) {
    try {
        const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${BranchDetailsRANGE}?key=${apiKey}`);
        
        if (!response.ok) {
            const errorText = await response.text(); // Get error details
            throw new Error(`Failed to fetch data from Google Sheets: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        
        if (!data.values) {
            throw new Error('No data returned from Google Sheets');
        }
        
        // Assuming column A contains location names and column O contains status
        const locations = data.values
            .filter(row => row[14] && row[14].toLowerCase() === 'active') // Filter rows where status is 'Active'
            .map(row => row[2]); // Get location names from column C (index 2)
        
        // Populate the dropdown
        locationSelect.innerHTML = '<option value="">Select a location</option>'; // Clear existing options
        locations.forEach(location => {
            const option = document.createElement('option');
            option.value = location;
            option.textContent = location;
            locationSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching locations:', error.message); // Log error message
    }
}
