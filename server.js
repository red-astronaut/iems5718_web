const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const cors = require('cors'); // 引入cors中间件
const app = express();

// 配置MySQL连接
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1346798520lM',
    database: 'web_proj',
    port: 3306
});

db.connect((err) => {
    if (err) throw err;
    console.log('MySQL Connected...');
});

// 使用cors中间件
app.use(cors());

// 配置body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// 配置multer
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, // 10MB
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('productImage');

// 检查文件类型
function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}

// 设置静态文件夹
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/html', express.static(path.join(__dirname, 'html')));
app.use(express.static(path.join(__dirname))); // 提供根目录下的静态文件

// 管理类别的HTML表单
app.get('/admin/categories', (req, res) => {
    res.sendFile(path.join(__dirname, 'html/admin_categories.html'));
});

// 管理产品的HTML表单
app.get('/admin/products', (req, res) => {
    res.sendFile(path.join(__dirname, 'html/admin_products.html'));
});

// 插入类别
app.post('/addCategory', (req, res) => {
    const name = req.body.name;
    if (!name) {
        return res.status(400).send('Category name is required');
    }
    let sql = 'INSERT INTO categories (name) VALUES (?)';
    let query = db.query(sql, [name], (err, result) => {
        if (err) throw err;
        res.redirect('/html/admin.html');
    });
});

// 删除类别
app.delete('/deleteCategory/:id', (req, res) => {
    let sql = 'DELETE FROM categories WHERE catid = ?';
    let query = db.query(sql, [req.params.id], (err, result) => {
        if (err) throw err;
        res.send('Category deleted');
    });
});

// 更新类别
app.put('/updateCategory/:id', (req, res) => {
    let sql = 'UPDATE categories SET name = ? WHERE catid = ?';
    let query = db.query(sql, [req.body.name, req.params.id], (err, result) => {
        if (err) throw err;
        res.send('Category updated');
    });
});

// 插入产品
app.post('/addProduct', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            res.send(err);
        } else {
            if (req.file == undefined) {
                res.send('Error: No File Selected!');
            } else {
                const imagePath = req.file.path;
                const thumbnailPath = `uploads/thumbnail-${req.file.filename}`;
                sharp(imagePath)
                    .resize(200, 200)
                    .toFile(thumbnailPath, (err, info) => {
                        if (err) throw err;
                        let sql = 'INSERT INTO products (catid, name, price, description, image) VALUES (?, ?, ?, ?, ?)';
                        let query = db.query(sql, [req.body.catid, req.body.name, req.body.price, req.body.description, thumbnailPath], (err, result) => {
                            if (err) throw err;
                            updateCategoryPage(req.body.catid);
                            updateProductData();
                            res.redirect('/html/admin.html');
                        });
                    });
            }
        }
    });
});

// 删除产品
app.delete('/deleteProduct/:id', (req, res) => {
    let sql = 'SELECT catid FROM products WHERE pid = ?';
    db.query(sql, [req.params.id], (err, result) => {
        if (err) throw err;
        const catid = result[0].catid;
        let deleteSql = 'DELETE FROM products WHERE pid = ?';
        db.query(deleteSql, [req.params.id], (err, result) => {
            if (err) throw err;
            updateCategoryPage(catid);
            updateProductData();
            res.send('Product deleted');
        });
    });
});

// 更新产品
app.put('/updateProduct/:id', (req, res) => {
    let sql = 'UPDATE products SET catid = ?, name = ?, price = ?, description = ? WHERE pid = ?';
    let query = db.query(sql, [req.body.catid, req.body.name, req.body.price, req.body.description, req.params.id], (err, result) => {
        if (err) throw err;
        updateCategoryPage(req.body.catid);
        updateProductData();
        res.send('Product updated');
    });
});

// 更新类别页面
function updateCategoryPage(catid) {
    let sql = 'SELECT * FROM products WHERE catid = ?';
    db.query(sql, [catid], (err, products) => {
        if (err) throw err;

        let categorySql = 'SELECT name FROM categories WHERE catid = ?';
        db.query(categorySql, [catid], (err, category) => {
            if (err) throw err;

            if (category.length === 0) {
                console.error('Category not found');
                return;
            }

            const categoryName = category[0].name.replace(/\s+/g, '_').toLowerCase();
            const filePath = path.join(__dirname, `html/${categoryName}.html`);

            let htmlContent = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <title>${category[0].name}</title>
                    <link rel="stylesheet" href="../css/style.css">
                    <script src="../js/productdata.js" defer></script>
                    <script src="../js/cart.js" defer></script>
                </head>
                <body>
                    <header>
                        <h1>${category[0].name}</h1>
                        <nav>
                            <ul>
                                <li><a href="index.html">Home</a></li>
                                <li class="shopping-list">
                                    <a href="cart.html">Cart</a>
                                    <ul class="dropdown" id="shopping-list-dropdown"></ul>
                                </li>
                            </ul>
                        </nav>
                    </header>
                    <main>
                        <nav aria-label="breadcrumb">
                            <ol class="breadcrumb">
                                <li><a href="index.html">Home</a></li>
                                <li><a href="${categoryName}.html">${category[0].name}</a></li>
                            </ol>
                        </nav>
                        <section class="product-list">
            `;

            products.forEach(product => {
                htmlContent += `
                    <article class="product">
                        <a href="product.html?productid=${product.pid}">
                            <img src="../${product.image}" alt="Product ${product.pid}">
                        </a>
                        <h2>${product.name}</h2>
                        <p>Price: $${product.price}</p>
                    </article>
                `;
            });

            htmlContent += `
                        </section>
                        <div class="pagination">
                            <a href="${categoryName}.html?page=1">1</a>
                        </div>
                    </main>
                    <footer>
                        <p>&copy; 2025 ShoppingRed Mall</p>
                    </footer>
                </body>
                </html>
            `;

            fs.writeFileSync(filePath, htmlContent, 'utf8');
        });
    });
}

// 更新产品数据
function updateProductData() {
    let sql = `
        SELECT p.pid, p.name, p.description, p.price, p.image, c.name as category
        FROM products p
        JOIN categories c ON p.catid = c.catid
    `;
    db.query(sql, (err, products) => {
        if (err) throw err;

        let productDataContent = `
            // productdata.js

            const productdata = {
        `;

        products.forEach(product => {
            productDataContent += `
                ${product.pid}: {
                    name: '${product.name}',
                    description: '${product.description}',
                    price: ${product.price},
                    image: '../${product.image}',
                    category: '${product.category.replace(/\s+/g, '_').toLowerCase()}'
                },
            `;
        });

        productDataContent += `
            };

            // Function to get product details by productid
            function getProductDetails(productid) {
                return productdata[productid];
            }
        `;

        fs.writeFileSync(path.join(__dirname, 'js/productdata.js'), productDataContent, 'utf8');
    });
}

// 获取所有类别
app.get('/categories', (req, res) => {
    let sql = 'SELECT * FROM categories';
    let query = db.query(sql, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// 获取所有产品
app.get('/products', (req, res) => {
    let sql = 'SELECT * FROM products';
    let query = db.query(sql, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// 根据类别获取产品
app.get('/products/:catid', (req, res) => {
    let sql = 'SELECT * FROM products WHERE catid = ?';
    let query = db.query(sql, [req.params.catid], (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// 获取产品详情
app.get('/product/:pid', (req, res) => {
    let sql = 'SELECT p.*, c.name as category FROM products p JOIN categories c ON p.catid = c.catid WHERE p.pid = ?';
    let query = db.query(sql, [req.params.pid], (err, result) => {
        if (err) throw err;
        res.json(result[0]);
    });
});

// 启动服务器
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});