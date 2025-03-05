const express = require('express');
const router = express.Router();
const controllers = require('./controllers');

router.get('/products', controllers.getAllProducts);
router.get('/products/:id', controllers.getProductById);
router.post('/products', controllers.addProduct);
router.put('/products/:id', controllers.updateProduct);
router.delete('/products/:id', controllers.deleteProduct);
router.get('/categories', controllers.getCategories);

module.exports = router;