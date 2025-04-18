-- 创建数据库
CREATE DATABASE web_proj;

-- 使用数据库
USE web_proj;

-- 创建分类表
CREATE TABLE categories (
    catid INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- 创建商品表
CREATE TABLE products (
    pid INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    catid INT,
    image VARCHAR(255),
    FOREIGN KEY (catid) REFERENCES categories(catid)
);
-- 插入示例分类数据
INSERT INTO categories (name) VALUES 
;

-- 插入示例商品数据
INSERT INTO products (name, price, description, catid, image) VALUES 
;

-- 创建用户表
CREATE TABLE users (
    userid INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    isAdmin BOOLEAN DEFAULT FALSE
);

-- 插入管理员用户
INSERT INTO users (email, password, isAdmin) VALUES 
('1253912982@qq.com', '$2b$10$Tplv9WjV3QXj7RGczFfKNO1g9FN/5Zdd1DCm3oGsAbO1tWEsZFtBG', 1);

-- 插入普通用户
INSERT INTO users (email, password, isAdmin) VALUES 
('1155222656@link.cuhk.edu.hk', '$2b$10$Tplv9WjV3QXj7RGczFfKNO1g9FN/5Zdd1DCm3oGsAbO1tWEsZFtBG', 0);

-- 查看所有数据库
SHOW DATABASES;

-- 删除数据库（如果需要重新创建）
DROP DATABASE IF EXISTS web_proj;

-- 查看所有表
SHOW TABLES;

-- 删除表（如果需要重新创建）
DROP TABLE IF EXISTS users;

-- 修改用户密码
UPDATE users SET password = 'new_hashed_password' WHERE userid = 1;

-- 修改用户权限
UPDATE users SET isAdmin = 1 WHERE userid = 1;