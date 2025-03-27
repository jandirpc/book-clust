const express = require('express');
const obtenerLibros = require('./librosScraper');
const clusterizar = require('./librosCluster');
const getConnection = require('./connection');

const router = express.Router();

router.get('/scrape', async (req, res) => {
  try {
    const libros = await obtenerLibros();
    const db = await getConnection();
    await db.execute('DELETE FROM libros');

    for (const libro of libros) {
      await db.execute(
        'INSERT INTO libros (precio, titulo, rating, genero) VALUES (?, ?, ?, ?)',
        [libro.precio, libro.titulo, libro.rating, libro.genero]
      );
    }

    res.json({ message: 'Catálogo actualizado con éxito' });
  } catch (error) {
    console.error('ERROR:', error);
    res.status(500).json({ error: 'Error al actualizar el catálogo' });
  }
});

router.get('/datos', async (req, res) => {
  try {
    const db = await getConnection();
    const [datos] = await db.query('SELECT * FROM libros ORDER BY precio ASC'); // 👈 Ordena por precio
    res.json(datos);
  } catch (error) {
    console.error('ERROR:', error);
    res.status(500).json({ error: 'Error al obtener los datos' });
  }
});

router.get('/cluster', async (req, res) => {
  try {
    const datosCluster = await clusterizar();
    if (!datosCluster || datosCluster.length === 0) {
      return res.status(404).json({ error: "No se encontraron libros" });
    }
    res.json(datosCluster);
  } catch (error) {
    console.error('Error en /cluster:', error);
    res.status(500).json({ error: "Error al clusterizar datos" });
  }
});

module.exports = router;
