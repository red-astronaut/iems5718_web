const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const app = express();

// 配置MySQL连接
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'your_password',
    database: 'web_proj',
    port: 3306
});

db.connect((err) => {
    if (err) throw err;
    console.log('MySQL Connected...');
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
app.use('/uploads', express.static('uploads'));

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
    let sql = 'INSERT INTO categories (name) VALUES (?)';
    let query = db.query(sql, [req.body.name], (err, result) => {
        if (err) throw err;
        res.redirect('/admin/categories');
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
                let sql = 'INSERT INTO products (catid, name, price, description, image) VALUES (?, ?, ?, ?, ?)';
                let query = db.query(sql, [req.body.catid, req.body.name, req.body.price, req.body.description, req.file.path], (err, result) => {
                    if (err) throw err;
                    res.redirect('/admin/products');
                });
            }
        }
    });
});

// 获取所有类别
app.get('/categories', (req, res) => {
    let sql = 'SELECT * FROM categories';
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

// 启动服务器
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});