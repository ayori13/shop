const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', routes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`REST API сервер запущен на http://localhost:${PORT}`);
});
