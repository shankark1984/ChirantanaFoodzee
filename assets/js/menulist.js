const SHEET_ID = '1mle7fv9FiBj2cu7h7LLF-a9JnPbSx-6w1WhjH76CegQ'; // Replace with your sheet ID
const API_KEY = 'AIzaSyDr1hKI4jpsDw4_WfVTt81obTNLgIdU6P4'; // Replace with your API key
const RANGE = 'MEMU!A1:K'; // Range for your sheet (adjust as necessary)

let cart = [];
let menuItems = []; // Store fetched menu items

async function fetchMenuItems() {
    try {
        const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`);
        const data = await response.json();
        menuItems = data.values ? data.values.slice(1).map(row => ({
            foodCodeImg: row[10], // Assuming column K has image URLs
            name: row[4],
            price: row[6],
            isVeg: row[2].toLowerCase() === 'vegetarian' // Assuming column C has veg/non-veg information
        })) : [];
        renderMenu(menuItems);
    } catch (error) {
        console.error('Error fetching menu items:', error);
    }
}

function getImageUrl(foodCodeImg) {
    // Generate the image URL based on the food code
    return `assets/img/menuImg/${foodCodeImg}.jpg`; // Replace with your actual image URL pattern
}

function renderMenu(items) {
    const menuContainer = document.getElementById('menu-list-container');
    menuContainer.innerHTML = ''; // Clear existing menu items

    items.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.classList.add('menu-item');
        itemElement.innerHTML = `
            <img src="${getImageUrl(item.foodCodeImg)}" alt="${item.name}" class="menu-item-image">
            <div class="menu-item-details">
                <span class="menu-item-name">${item.name}</span>
                <span class="menu-item-price">${item.price}</span>
            </div>
            <button class="add-to-cart-button ${item.isVeg ? 'vegetarian' : 'non-veg'}" data-id="${index}">Add to Cart</button>
        `;
        menuContainer.appendChild(itemElement);
    });

    // Add event listeners for "Add to Cart" buttons
    menuContainer.addEventListener('click', event => {
        if (event.target.classList.contains('add-to-cart-button')) {
            const itemId = event.target.getAttribute('data-id');
            const selectedItem = items[itemId];
            cart.push(selectedItem);
            renderCart();
        }
    });
}

function renderCart() {
    const cartContainer = document.getElementById('cart-container');
    cartContainer.innerHTML = ''; // Clear existing cart items

    cart.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.classList.add('cart-item');
        itemElement.innerHTML = `
            <span class="cart-item-name">${item.name}</span>
            <span class="cart-item-price">${item.price}</span>
            <button class="remove-from-cart-button" data-id="${index}">Remove</button>
        `;
        cartContainer.appendChild(itemElement);
    });

    // Add event listeners for "Remove" buttons
    cartContainer.addEventListener('click', event => {
        if (event.target.classList.contains('remove-from-cart-button')) {
            const itemId = event.target.getAttribute('data-id');
            cart.splice(itemId, 1); // Remove item from cart
            renderCart();
        }
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    await fetchMenuItems();
    renderCart(); // Initial render of the cart

    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', (event) => {
        const searchTerm = event.target.value.toLowerCase();
        filterAndRenderMenu(searchTerm, document.getElementById('filter-select').value);
    });

    const filterSelect = document.getElementById('filter-select');
    filterSelect.addEventListener('change', (event) => {
        const filter = event.target.value;
        filterAndRenderMenu(document.getElementById('search-input').value.toLowerCase(), filter);
    });
});

function filterAndRenderMenu(searchTerm, filter) {
    const filteredItems = menuItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm);
        const matchesFilter = filter === 'both' || (filter === 'veg' && item.isVeg) || (filter === 'non-veg' && !item.isVeg);
        return matchesSearch && matchesFilter;
    });
    renderMenu(filteredItems);
}
