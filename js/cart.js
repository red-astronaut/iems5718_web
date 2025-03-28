// cart.js

document.addEventListener('DOMContentLoaded', function() {
    updateShoppingList();
});

function updateShoppingList() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const shoppingListDropdown = document.getElementById('shopping-list-dropdown');

    // Clear existing items
    shoppingListDropdown.innerHTML = '';

    if (cart.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.textContent = 'Your shopping list is empty.';
        shoppingListDropdown.appendChild(emptyMessage);
    } else {
        let totalPrice = 0;
        cart.forEach(item => {
            const product = getProductDetails(item.productid);
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <span>${product.name}</span>
                <span>Price: $${product.price.toFixed(2)}</span>
                <div>
                    <span>Quantities:</span>
                    <input type="number" class="quantity" value="${item.quantity}" min="1" style="width: 50px;">
                    <button class="increment">+</button>
                    <button class="decrement">-</button>
                </div>
            `;

            // Add increment and decrement buttons
            const incrementButton = listItem.querySelector('.increment');
            incrementButton.addEventListener('click', () => {
                item.quantity++;
                localStorage.setItem('cart', JSON.stringify(cart));
                updateShoppingList();
            });

            const decrementButton = listItem.querySelector('.decrement');
            decrementButton.addEventListener('click', () => {
                if (item.quantity > 1) {
                    item.quantity--;
                } else {
                    if (confirm('This is the last item. Do you want to delete it?')) {
                        cart.splice(cart.indexOf(item), 1);
                    }
                }
                localStorage.setItem('cart', JSON.stringify(cart));
                updateShoppingList();
            });

            // Add quantity input change event
            const quantityInput = listItem.querySelector('.quantity');
            quantityInput.addEventListener('change', (event) => {
                const newQuantity = parseInt(event.target.value);
                if (newQuantity > 0) {
                    item.quantity = newQuantity;
                } else {
                    cart.splice(cart.indexOf(item), 1);
                }
                localStorage.setItem('cart', JSON.stringify(cart));
                updateShoppingList();
            });

            shoppingListDropdown.appendChild(listItem);
            totalPrice += product.price * item.quantity;
        });

        // Add total price
        const totalPriceItem = document.createElement('li');
        totalPriceItem.textContent = `Total Price: $${totalPrice.toFixed(2)}`;
        shoppingListDropdown.appendChild(totalPriceItem);

        // Add actions container
        const actionsContainer = document.createElement('li');
        actionsContainer.classList.add('actions');

        // Add Checkout button
        const checkoutButton = document.createElement('button');
        checkoutButton.textContent = 'Checkout';
        checkoutButton.onclick = checkout;
        actionsContainer.appendChild(checkoutButton);

        // Add Clear Cart button
        const clearCartButton = document.createElement('button');
        clearCartButton.textContent = 'Clear Cart';
        clearCartButton.onclick = clearCart;
        actionsContainer.appendChild(clearCartButton);

        shoppingListDropdown.appendChild(actionsContainer);
    }
}

function addToCart(productid, quantity) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Check if the product is already in the cart
    let found = false;
    for (let item of cart) {
        if (item.productid === productid) {
            item.quantity += quantity; // Add the specified quantity
            found = true;
            break;
        }
    }

    // If not found, add it as a new item
    if (!found) {
        cart.push({ productid: productid, quantity: quantity });
    }

    // Save the updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Update the shopping list
    updateShoppingList();
}

function checkout() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    let totalPrice = 0;

    cart.forEach(item => {
        const product = getProductDetails(item.productid);
        totalPrice += product.price * item.quantity;
    });

    if (totalPrice > 0) {
        if (confirm('Total price is $' + totalPrice.toFixed(2) + '. Proceed to checkout?')) {
            // Clear cart after checkout
            localStorage.removeItem('cart');
            updateShoppingList();
            alert('Thank you for your purchase!');
        }
    } else {
        alert('Your cart is empty. Add items to the cart before checkout.');
    }
}

function clearCart() {
    if (confirm("Are you sure you want to clear your cart?")) {
        localStorage.removeItem('cart');
        updateShoppingList();
        alert('Cart has been cleared.');
    }
}

function getProductDetails(productid) {
    return productdata[productid];
}