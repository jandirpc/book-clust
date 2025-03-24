const getConnection = require('./connection');
const mlKmeans = require('ml-kmeans');

const etiquetasPrecio = ['Bajo', 'Medio', 'Caro'];

function normalizarDatos(datos) {
  const minPrecio = Math.min(...datos.map(d => d[0]));
  const maxPrecio = Math.max(...datos.map(d => d[0]));
  const minRating = Math.min(...datos.map(d => d[1]));
  const maxRating = Math.max(...datos.map(d => d[1]));

  return datos.map(d => [
    (d[0] - minPrecio) / (maxPrecio - minPrecio), // Normalizar precio
    (d[1] - minRating) / (maxRating - minRating),  // Normalizar rating
    d[2]  // Género ya está codificado, no necesita normalización
  ]);
}

async function clusterizar() {
  const db = await getConnection();
  const [rows] = await db.query('SELECT id, titulo, precio, rating, genero FROM libros');

  if (rows.length < 3) {
    return { message: 'Se necesitan al menos 3 registros para aplicar clustering.' };
  }

  const generosUnicos = [...new Set(rows.map(r => r.genero))];
  const codificarGenero = g => generosUnicos.indexOf(g);
  const datos = rows.map(r => [r.precio, r.rating, codificarGenero(r.genero)]);
  const datosNormalizados = normalizarDatos(datos);

  const resultado = mlKmeans.kmeans(datosNormalizados, 3);

  // Ordenar los centroides por el valor del precio (primera columna)
  const centroides = resultado.centroids.map(c => c[0]);
  const orden = centroides
    .map((centroide, index) => ({ centroide, index }))
    .sort((a, b) => a.centroide - b.centroide)
    .map(a => a.index);

  // Asignar etiquetas basadas en el orden de los centroides
  const mapaGrupo = orden.map((_, i) => etiquetasPrecio[i]);

  return rows.map((r, i) => ({
    ...r,
    grupo: mapaGrupo[resultado.clusters[i]]
  }));
}

module.exports = clusterizar;