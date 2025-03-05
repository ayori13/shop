const fs = require('fs');
const path = require('path');

const productsFilePath = path.join(__dirname, '../../client-server/data/products.json');

const readProducts = () => {
  try {
    const data = fs.readFileSync(productsFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Ошибка при чтении файла товаров:', error);
    return { products: [] };
  }
};

const writeProducts = (products) => {
  try {
    fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Ошибка при записи файла товаров:', error);
    return false;
  }
};

const getAllProducts = (req, res) => {
  const products = readProducts();
  res.json(products);
};

const getProductById = (req, res) => {
  const { id } = req.params;
  const products = readProducts();
  const product = products.products.find(p => p.id === parseInt(id));
  
  if (!product) {
    return res.status(404).json({ error: 'Товар не найден' });
  }
  
  res.json(product);
};

const addProduct = (req, res) => {
  const productsData = readProducts();
  const productsToAdd = Array.isArray(req.body) ? req.body : [req.body];
  
  const maxId = productsData.products.reduce((max, p) => (p.id > max ? p.id : max), 0);
  
  productsToAdd.forEach((product, index) => {
    productsData.products.push({
      ...product,
      id: maxId + index + 1
    });
  });
  
  if (writeProducts(productsData)) {
    res.status(201).json(productsToAdd.length === 1 ? productsToAdd[0] : productsToAdd);
  } else {
    res.status(500).json({ error: 'Ошибка при сохранении товара' });
  }
};

const updateProduct = (req, res) => {
  const { id } = req.params;
  const productsData = readProducts();
  const productIndex = productsData.products.findIndex(p => p.id === parseInt(id));
  
  if (productIndex === -1) {
    return res.status(404).json({ error: 'Товар не найден' });
  }
  
  productsData.products[productIndex] = {
    ...req.body,
    id: parseInt(id)
  };
  
  if (writeProducts(productsData)) {
    res.json(productsData.products[productIndex]);
  } else {
    res.status(500).json({ error: 'Ошибка при обновлении товара' });
  }
};

const deleteProduct = (req, res) => {
  const { id } = req.params;
  const productsData = readProducts();
  const productIndex = productsData.products.findIndex(p => p.id === parseInt(id));
  
  if (productIndex === -1) {
    return res.status(404).json({ error: 'Товар не найден' });
  }
  
  const deletedProduct = productsData.products[productIndex];
  productsData.products.splice(productIndex, 1);
  
  if (writeProducts(productsData)) {
    res.json(deletedProduct);
  } else {
    res.status(500).json({ error: 'Ошибка при удалении товара' });
  }
};

const getCategories = (req, res) => {
  const productsData = readProducts();
  const categories = [...new Set(productsData.products.flatMap(product => product.categories))];
  res.json({ categories });
};

module.exports = {
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  getCategories
};