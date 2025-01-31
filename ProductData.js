// productData.js

const productData = {
    1: {
        name: 'Calendar',
        description: 'A moveable calendar with adjustable labels.',
        price: 10.00,
        image: 'Figure/calendar.png',
        category: 'Daily Essentials'
    },
    2: {
        name: 'Cup',
        description: 'A cup with a unique design.',
        price: 3.99,
        image: 'Figure/cup.png',
        category: 'Daily Essentials'
    },
    3: {
        name: 'Hammer',
        description: 'A hammer for all your hammering needs.',
        price: 6.20,
        image: 'Figure/hammer.png',
        category: 'Tools'
    },
    4: {
        name: 'Duffy doll',
        description: 'A cute Duffy doll.',
        price: 30.00,
        image: 'Figure/Duffy.png',
        category: 'Disney Gifts'
    },
    5: {
        name: 'Beller doll',
        description: 'A cute Beller doll.',
        price: 188.00,
        image: 'Figure/Beller.png',
        category: 'Disney Gifts'
    },
    6: {
        name: 'Olu doll',
        description: 'A cute and cool Olu doll.',
        price: 999.00,
        image: 'Figure/olu.png',
        category: 'Disney Gifts'
    }
};

// Function to get product details by productId
function getProductDetails(productId) {
    return productData[productId];
}
