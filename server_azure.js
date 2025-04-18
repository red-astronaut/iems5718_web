const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const cors = require('cors'); // 引入cors中间件
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
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

// 配置 CORS
app.use(cors({
    origin: true, // 允许所有来源
    credentials: true // 允许发送凭证
}));

// 设置其他必要的响应头
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

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

app.use(cookieParser());

const JWT_SECRET = 'IEMS5718'; // 替换为更安全的密钥

function authenticateToken(req, res, next) {
    const token = req.cookies.authToken;

    if (!token) {
        return res.redirect('/login');
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.redirect('/login');
        }

        req.user = user; // 将解码后的用户信息存储到 req.user
        next();
    });
}

// 管理类别的HTML表单
app.get('/admin/categories', authenticateToken, (req, res) => {
    if (!req.user.isAdmin) {
        return res.status(403).send('Access denied');
    }

    res.sendFile(path.join(__dirname, 'html/admin_categories.html'));
});

// 管理产品的HTML表单
app.get('/admin/products', (req, res) => {
    res.sendFile(path.join(__dirname, 'html/admin_products.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'html/login.html'));
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // 验证输入
    if (!email || !password) {
        return res.status(400).send('Invalid input');
    }

    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], (err, results) => {
        if (err) throw err;

        if (results.length === 0) {
            return res.status(401).send('Invalid email or password');
        }

        const user = results[0];

        // 验证密码
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;

            if (!isMatch) {
                return res.status(401).send('Invalid email or password');
            }

            // 生成 JWT
            const token = jwt.sign({ userid: user.userid, email: user.email, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: '3d' });

            // 设置 cookie
            res.cookie('authToken', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Lax',
                domain: '172.167.9.47', // 设置为您的域名
                path: '/',
                maxAge: 3 * 24 * 60 * 60 * 1000 // 3天
            });

            // 重定向到管理员面板或主页
            if (user.isAdmin) {
                res.redirect('/html/admin.html'); // 修改为定向到 admin.html
            } else {
                res.redirect('/html/index.html'); // 修改为定向到 index.html
            }
        });
    });
});

//logout route
app.post('/logout', (req, res) => {
    res.clearCookie('authToken');
    res.redirect('/login');
});

// GET 路由：返回修改密码页面
app.get('/changePassword', (req, res) => {  // 移除 authenticateToken 中间件
    res.sendFile(path.join(__dirname, 'html/change_password.html'));
});

// POST 路由：处理密码更改逻辑
app.post('/changePassword', authenticateToken, (req, res) => {
    const { email, currentPassword, newPassword } = req.body;

    if (!email || !currentPassword || !newPassword) {
        return res.status(400).send('Invalid input');
    }

    const sql = 'SELECT * FROM users WHERE email = ? AND userid = ?';
    db.query(sql, [email, req.user.userid], (err, results) => {
        if (err) throw err;

        if (results.length === 0) {
            return res.status(404).send('Email not found or does not match the logged-in user');
        }

        const user = results[0];

        // 验证当前密码
        bcrypt.compare(currentPassword, user.password, (err, isMatch) => {
            if (err) throw err;

            if (!isMatch) {
                return res.status(401).send('Current password is incorrect');
            }

            // 哈希新密码
            const hashedPassword = bcrypt.hashSync(newPassword, 10);

            const updateSql = 'UPDATE users SET password = ? WHERE userid = ?';
            db.query(updateSql, [hashedPassword, req.user.userid], (err, result) => {
                if (err) throw err;

                // 清除身份令牌并重定向到登录页面
                res.clearCookie('authToken');
                res.send('Password changed successfully. Please log in again.');
            });
        });
    });
});

// 插入类别
app.post('/addCategory', (req, res) => {
    const name = req.body.name;

    // 验证输入
    if (!name || !validator.isAlpha(name.replace(/\s/g, ''))) {
        return res.status(400).send('Invalid input');
    }

    // 使用参数化SQL语句
    const sql = 'INSERT INTO categories (name) VALUES (?)';
    db.query(sql, [name], (err, result) => {
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
            const { catid, name, price, description } = req.body;

            // 验证输入
            if (!catid || !name || !price || !description || 
                !validator.isInt(String(catid)) || 
                !validator.isAlpha(name.replace(/\s/g, '')) || 
                !validator.isFloat(String(price)) || 
                !validator.isLength(description, { min: 1 })) {
                return res.status(400).send('Invalid input');
            }

            if (req.file == undefined) {
                res.send('Error: No File Selected!');
            } else {
                const imagePath = req.file.path;
                const thumbnailPath = `uploads/thumbnail-${req.file.filename}`;
                sharp(imagePath)
                    .resize(200, 200)
                    .toFile(thumbnailPath, (err, info) => {
                        if (err) throw err;

                        // 使用参数化SQL语句
                        const sql = 'INSERT INTO products (catid, name, price, description, image) VALUES (?, ?, ?, ?, ?)';
                        db.query(sql, [catid, name, price, description, thumbnailPath], (err, result) => {
                            if (err) throw err;
                            updateCategoryPage(catid);
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
    const pid = req.params.id;

    // 验证输入
    if (!pid || !validator.isInt(String(pid))) {
        return res.status(400).send('Invalid input');
    }

    // 使用参数化SQL语句
    const sql = 'SELECT catid FROM products WHERE pid = ?';
    db.query(sql, [pid], (err, result) => {
        if (err) throw err;
        const catid = result[0].catid;

        const deleteSql = 'DELETE FROM products WHERE pid = ?';
        db.query(deleteSql, [pid], (err, result) => {
            if (err) throw err;
            updateCategoryPage(catid);
            updateProductData();
            res.send('Product deleted');
        });
    });
});

// 更新产品
app.put('/updateProduct/:id', (req, res) => {
    const { catid, name, price, description } = req.body;
    const pid = req.params.id;

    // 验证输入
    if (!pid || !catid || !name || !price || !description || 
        !validator.isInt(String(pid)) || 
        !validator.isInt(String(catid)) || 
        !validator.isAlpha(name.replace(/\s/g, '')) || 
        !validator.isFloat(String(price)) || 
        !validator.isLength(description, { min: 1 })) {
        return res.status(400).send('Invalid input');
    }

    // 使用参数化SQL语句
    const sql = 'UPDATE products SET catid = ?, name = ?, price = ?, description = ? WHERE pid = ?';
    db.query(sql, [catid, name, price, description, pid], (err, result) => {
        if (err) throw err;
        updateCategoryPage(catid);
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
                                    <a href="#">Cart</a>
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

// 获取当前登录用户信息
app.get('/currentUser', (req, res) => {
    const token = req.cookies.authToken;
    
    if (!token) {
        return res.json({ message: 'Please login' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error('Token verification error:', err);
            return res.json({ message: 'Please login' });
        }
        // 添加响应头
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Origin', req.headers.origin);
        res.json({ 
            email: user.email,
            isAdmin: user.isAdmin 
        });
    });
});

// 添加新的路由用于处理管理员页面访问
app.get('/admin', (req, res) => {
    const token = req.cookies.authToken;
    
    if (!token) {
        return res.redirect('/html/login.html');
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.redirect('/html/login.html');
        }

        if (!user.isAdmin) {
            res.send(`
                <h2>You are not authorized to access this page.</h2>
                <a href="/html/index.html">Back to Home</a>
            `);
            return;
        }

        res.sendFile(path.join(__dirname, 'html', 'admin.html'));
    });
});

// 启动服务器
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'
app.listen(PORT, () => {
    console.log(`Server started on http://${HOST}:port ${PORT}`);
});

//nginx sudo nano /etc/nginx/sites-available/default
// server {
//     listen 80;
//     server_name 172.167.9.47;

//     location / {
//         proxy_pass http://localhost:5000;
//         proxy_http_version 1.1;
//         proxy_set_header Upgrade $http_upgrade;
//         proxy_set_header Connection 'upgrade';
//         proxy_set_header Host $host;
//         proxy_cache_bypass $http_upgrade;
//         proxy_set_header X-Real-IP $remote_addr;
//         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
//         # 添加 CORS headers
//         add_header 'Access-Control-Allow-Credentials' 'true';
//         add_header 'Access-Control-Allow-Origin' $http_origin;
//         add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE';
//         add_header 'Access-Control-Allow-Headers' 'DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization';
//     }
// }