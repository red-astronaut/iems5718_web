// productid.js

// Function to get product ID from URL parameters
function getproductid() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('productid');
}


// Function to load product details based on the productid
function loadProduct() {
    const productid = getproductid(); // Get the productid from URL
    const product = getProductDetails(productid); // Get the product details based on productid

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
function addToCart(productid) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    const productInCart = cart.find(item => item.productid === productid);
    if (productInCart) {
        productInCart.quantity++;
    } else {
        cart.push({ productid: productid, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Item added to cart!');
}

// Function to get product details by productid
function getProductDetails(productid) {
    return products[productid];
}

// Call the loadProduct function to populate the page when it loads
document.addEventListener('DOMContentLoaded', function () {
    loadProduct(); // Load product details
    const productid = getproductid();

    // Add to Cart functionality
    document.getElementById('addToCartButton').addEventListener('click', function () {
        addToCart(productid); // Add the current product to the cart
    });
});
