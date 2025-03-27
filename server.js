const express = require('express');
const cors = require('cors');
const librosRoutes = require('./librosRoutes');
const app = express();

app.use(cors());
app.use(express.json());
app.use('/libros', librosRoutes);
app.use(express.static('public'));

app.listen(3000, () => console.log('Servidor corriendo en http://localhost:3000'));
