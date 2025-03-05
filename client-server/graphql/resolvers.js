const fs = require('fs');
const path = require('path');

const loadProducts = () => {
  try {
    const productsPath = path.join(__dirname, '..', 'data', 'products.json');
    const rawData = fs.readFileSync(productsPath, 'utf8');
    return JSON.parse(rawData).products;
  } catch (error) {
    console.error('Ошибка загрузки продуктов:', error);
    return [];
  }
};

const resolvers = {
  Query: {
    getAllProducts: () => {
      const products = loadProducts();
      return products.map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        description: product.description,
        categories: product.categories || []
      }));
    },

    getProductDetails: ({ id }) => {
      const products = loadProducts();
      const productId = parseInt(id, 10);
      return products.find(product => product.id === productId) || null;
    },

    getProductsByCategory: ({ category }) => {
      const products = loadProducts();
      const filteredProducts = products
        .filter(product => product.categories.includes(category))
        .map(product => ({
          id: product.id,
          name: product.name,
          price: product.price,
          description: product.description,
          categories: product.categories || []
        }));
      
      return filteredProducts.length > 0 ? filteredProducts : [];
    },

    getCategories: () => {
      const products = loadProducts();
      return [...new Set(products.flatMap(product => product.categories))];
    }
  }
};

module.exports = resolvers;