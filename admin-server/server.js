const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');
const routes = require('./rest-api/routes');

const app = express();
const PORT = 8080;

app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use('/api', routes);
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`Сервер админки запущен на порту ${PORT}`);
}).on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Порт ${PORT} занят. Используем следующий.`);
    process.exit(1);
  }
});