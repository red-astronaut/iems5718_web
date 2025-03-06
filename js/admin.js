document.addEventListener('DOMContentLoaded', () => {
    const categoryForm = document.getElementById('category-form');
    const productForm = document.getElementById('product-form');
    const categoryList = document.getElementById('category-list');
    const productList = document.getElementById('product-list');
    const productCategorySelect = document.getElementById('product-category');

    // Fetch and display categories
    function fetchCategories() {
        fetch('/categories')
            .then(response => response.json())
            .then(categories => {
                categoryList.innerHTML = '';
                productCategorySelect.innerHTML = '<option value="">Select Category</option>';
                categories.forEach(category => {
                    const categoryItem = document.createElement('li');
                    categoryItem.classList.add('category-item');
                    categoryItem.textContent = category.name;

                    // 添加删除按钮
                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Delete';
                    deleteButton.classList.add('btn', 'btn-delete');
                    deleteButton.addEventListener('click', () => {
                        fetch(`/deleteCategory/${category.catid}`, {
                            method: 'DELETE'
                        }).then(() => {
                            fetchCategories();
                        });
                    });

                    // 添加更新按钮
                    const updateButton = document.createElement('button');
                    updateButton.textContent = 'Update';
                    updateButton.classList.add('btn', 'btn-update');
                    updateButton.addEventListener('click', () => {
                        const newName = prompt('Enter new category name:', category.name);
                        if (newName) {
                            fetch(`/updateCategory/${category.catid}`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ name: newName })
                            }).then(() => {
                                fetchCategories();
                            });
                        }
                    });

                    const buttonContainer = document.createElement('div');
                    buttonContainer.classList.add('button-container');
                    buttonContainer.appendChild(updateButton);
                    buttonContainer.appendChild(deleteButton);

                    categoryItem.appendChild(buttonContainer);
                    categoryList.appendChild(categoryItem);

                    const option = document.createElement('option');
                    option.value = category.catid;
                    option.textContent = category.name;
                    productCategorySelect.appendChild(option);
                });
            });
    }

    // Fetch and display products
    function fetchProducts(categoryId = '') {
        let url = '/products';
        if (categoryId) {
            url = `/products/${categoryId}`;
        }
        fetch(url)
            .then(response => response.json())
            .then(products => {
                productList.innerHTML = '';
                products.forEach(product => {
                    const productItem = document.createElement('li');
                    productItem.classList.add('product-item');
                    productItem.textContent = `Name: ${product.name}, Price($): ${product.price}`;

                    // 添加删除按钮
                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Delete';
                    deleteButton.classList.add('btn', 'btn-delete');
                    deleteButton.addEventListener('click', () => {
                        fetch(`/deleteProduct/${product.pid}`, {
                            method: 'DELETE'
                        }).then(() => {
                            fetchProducts(categoryId);
                        });
                    });

                    // 添加更新按钮
                    const updateButton = document.createElement('button');
                    updateButton.textContent = 'Update';
                    updateButton.classList.add('btn', 'btn-update');
                    updateButton.addEventListener('click', () => {
                        const newName = prompt('Enter new product name:', product.name);
                        const newPrice = prompt('Enter new product price:', product.price);
                        const newDescription = prompt('Enter new product description:', product.description);
                        if (newName && newPrice && newDescription) {
                            fetch(`/updateProduct/${product.pid}`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    catid: product.catid,
                                    name: newName,
                                    price: newPrice,
                                    description: newDescription
                                })
                            }).then(() => {
                                fetchProducts(categoryId);
                            });
                        }
                    });

                    const buttonContainer = document.createElement('div');
                    buttonContainer.classList.add('button-container');
                    buttonContainer.appendChild(updateButton);
                    buttonContainer.appendChild(deleteButton);

                    productItem.appendChild(buttonContainer);
                    productList.appendChild(productItem);
                });
            });
    }

    // Add category
    categoryForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const categoryName = document.getElementById('category-name').value;

        // 检查是否有输入类别名
        if (!categoryName) {
            alert('Category name is required');
            return;
        }

        fetch('/addCategory', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',  // 发送 JSON 格式的数据
            },
            body: JSON.stringify({
                name: categoryName,  // 发送类别名
            })
        })
        .then((response) => {
            if (response.ok) {
                fetchCategories();  // 更新类别列表
                categoryForm.reset();  // 重置表单
            } else {
                alert('Failed to add category');
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    });

    // Add product
    productForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(productForm);
        fetch('/addProduct', {
            method: 'POST',
            body: formData
        }).then(() => {
            fetchProducts();
            productForm.reset();
        });
    });

    // Filter products by category
    productCategorySelect.addEventListener('change', () => {
        const selectedCategoryId = productCategorySelect.value;
        fetchProducts(selectedCategoryId);
    });

    fetchCategories();
    fetchProducts();
});