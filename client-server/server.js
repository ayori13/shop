const express = require('express');
const path = require('path');
const fs = require('fs');
const morgan = require('morgan');
const cors = require('cors');
const { graphqlHTTP } = require('express-graphql');
const schema = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: resolvers,
  graphiql: true 
}));

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});

app.get('/api/products', (req, res) => {
  try {
    const productsData = fs.readFileSync(path.join(__dirname, 'data', 'products.json'), 'utf8');
    const products = JSON.parse(productsData);
    res.json(products);
  } catch (error) {
    console.error('Ошибка при чтении файла товаров:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

app.get('/api/products/category/:category', (req, res) => {
  try {
    const { category } = req.params;
    const productsData = fs.readFileSync(path.join(__dirname, 'data', 'products.json'), 'utf8');
    const products = JSON.parse(productsData).products;
    
    const filteredProducts = products.filter(product => 
      product.categories.includes(category)
    );
    
    res.json({ products: filteredProducts });
  } catch (error) {
    console.error('Ошибка при фильтрации товаров по категории:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

app.get('/api/categories', (req, res) => {
  try {
    const productsData = fs.readFileSync(path.join(__dirname, 'data', 'products.json'), 'utf8');
    const products = JSON.parse(productsData).products;
    
    const categories = [...new Set(products.flatMap(product => product.categories))];
    
    res.json({ categories });
  } catch (error) {
    console.error('Ошибка при получении категорий:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

app.listen(PORT, () => {
  console.log(`Клиентский сервер запущен на порту ${PORT}`);
});
