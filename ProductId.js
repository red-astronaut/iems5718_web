// productId.js

// Function to get product ID from URL parameters
function getProductId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('productId');
}


// Function to load product details based on the productId
function loadProduct() {
    const productId = getProductId(); // Get the productId from URL
    const product = getProductDetails(productId); // Get the product details based on productId

    if (product) {
        // Fill the product details into the HTML
        document.querySelector('.product-image img').src = product.image;
        document.querySelector('.product-image img').alt = `Name: ${product.name}`;
        document.querySelector('.product-info h2').textContent = `Name: ${product.name}`;
        document.querySelector('.product-info .description').textContent = `Description: ${product.description}`;
        document.querySelector('.product-info .price').textContent = `Price: $${product.price.toFixed(2)}`;
    } else {
        // If product is not found
        document.querySelector('.product-info').innerHTML = '<p>Product not found.</p>';
    }
}

// Function to add product to the cart
function addToCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    const productInCart = cart.find(item => item.productId === productId);
    if (productInCart) {
        productInCart.quantity++;
    } else {
        cart.push({ productId: productId, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Item added to cart!');
}

// Function to get product details by productId
function getProductDetails(productId) {
    return products[productId];
}

// Call the loadProduct function to populate the page when it loads
document.addEventListener('DOMContentLoaded', function () {
    loadProduct(); // Load product details
    const productId = getProductId();

    // Add to Cart functionality
    document.getElementById('addToCartButton').addEventListener('click', function () {
        addToCart(productId); // Add the current product to the cart
    });
});
