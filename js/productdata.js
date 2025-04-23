
            // productdata.js

            const productdata = {
        
                1: {
                    name: 'Calendar',
                    description: 'A moveable calendar with adjustable labels.',
                    price: 13,
                    image: '../../Figure/calendar.png',
                    category: 'daily_essentials'
                },
            
                2: {
                    name: 'Cup',
                    description: 'A cup with a unique design.',
                    price: 3.99,
                    image: '../../Figure/cup.png',
                    category: 'daily_essentials'
                },
            
                5: {
                    name: 'Duffy doll',
                    description: 'A cute Duffy doll.',
                    price: 30,
                    image: '../../Figure/Duffy.png',
                    category: 'disney_gifts'
                },
            
                6: {
                    name: 'Beller doll',
                    description: 'A cute Beller doll.',
                    price: 188,
                    image: '../../Figure/Beller.png',
                    category: 'disney_gifts'
                },
            
                7: {
                    name: 'Olu doll',
                    description: 'A cute and cool Olu doll.',
                    price: 999,
                    image: '../../Figure/olu.png',
                    category: 'disney_gifts'
                },
            
                3: {
                    name: 'Hammer',
                    description: 'A hammer for all your hammering needs.',
                    price: 6.3,
                    image: '../../Figure/hammer.png',
                    category: 'tools'
                },
            
                4: {
                    name: 'Pincers',
                    description: 'A good pincers.',
                    price: 5.5,
                    image: '../../Figure/pincers.png',
                    category: 'tools'
                },
            
                8: {
                    name: 'saw',
                    description: '111',
                    price: 3.7,
                    image: '../../Figure/saw.png',
                    category: 'tools'
                },
            
            };

            // Function to get product details by productid
            function getProductDetails(productid) {
                return productdata[productid];
            }
        