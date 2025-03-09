const express = require('express');
const mysql = require('mysql2/promise');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = 3000;
const upload = multer({ dest: 'uploads/' });


const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'iERG#4210+0219',
    database: 'store'
});

db.getConnection()
    .then(conn => {
        console.log('MySQL connected successfully');
        conn.release();
    })
    .catch(err => {
        console.error('MySQL connection failed:', err);
    });


app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(cors());


app.get('/api/categories', async (req, res, next) => {
    try {
        const [categories] = await db.query('SELECT * FROM categories');
        res.json(categories);
    } catch (err) {
        next(err);
    }
});

app.get('/api/products', async (req, res, next) => {
    try {
        const catid = req.query.catid;
        const query = catid ? 'SELECT * FROM products WHERE catid = ?' : 'SELECT * FROM products';
        const [products] = await db.query(query, catid ? [catid] : []);
        res.json(products);
    } catch (err) {
        next(err);
    }
});


app.get('/', (req, res) => {
  res.send('Hello IERG4210!');
});


app.post('/admin/add-product', upload.single('image'), async (req, res) => {
    const { catid, name, price, description } = req.body;
    const image = req.file;

    if (!catid || !name || !price || !image) {
        return res.status(400).send('Missing required fields');
    }

    try {
        const [result] = await db.query(
            'INSERT INTO products (catid, name, price, description) VALUES (?, ?, ?, ?)',
            [catid, name, price, description]
        );
        const pid = result.insertId;

        const imagePath = path.join(__dirname, 'images', `${pid}.jpg`);
        const thumbPath = path.join(__dirname, 'images', `${pid}-thumb.jpg`);

        await sharp(image.path).resize(800, 800).toFile(imagePath);
        await sharp(image.path).resize(200, 200).toFile(thumbPath);
        fs.unlinkSync(image.path);

        res.send('Product added successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});


app.get('/api/product/:pid', async (req, res, next) => {
    try {
        const [product] = await db.query('SELECT * FROM products WHERE pid = ?', [req.params.pid]);
        if (product.length === 0) return res.status(404).json({ error: 'Product not found' });
        res.json(product[0]);
    } catch (err) {
        next(err);
    }
});


app.post('/admin/add-category', async (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).send('Missing category name');
    }
    try {
        await db.query('INSERT INTO categories (name) VALUES (?)', [name]);
        res.send('Category added successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});


app.post('/admin/edit-category', async (req, res) => {
    const { catid, name } = req.body;
    if (!catid || !name) {
        return res.status(400).send('Missing category id or name');
    }
    try {
        const [result] = await db.query('UPDATE categories SET name = ? WHERE catid = ?', [name, catid]);
        if (result.affectedRows === 0) {
            return res.status(404).send('Category not found');
        }
        res.send('Category updated successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});


app.post('/admin/delete-category', async (req, res) => {
    const { catid } = req.body;
    if (!catid) {
        return res.status(400).send('Missing category id');
    }
    try {
        const [products] = await db.query('SELECT COUNT(*) as count FROM products WHERE catid = ?', [catid]);
        if (products[0].count > 0) {
            return res.status(400).send('Cannot delete category with existing products');
        }
        const [result] = await db.query('DELETE FROM categories WHERE catid = ?', [catid]);
        if (result.affectedRows === 0) {
            return res.status(404).send('Category not found');
        }
        res.send('Category deleted successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Internal Server Error');
});


app.listen(port, () => {
  console.log(`Server running at port ${port}`);
});