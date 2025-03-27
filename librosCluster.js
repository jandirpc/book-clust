const mysql = require('mysql2/promise');
const getConnection = require('./connection');
const mlKmeans = require('ml-kmeans');

async function clusterizar() {
  const db = await getConnection();
  const [rows] = await db.query('SELECT id, titulo, precio, rating, genero FROM libros');

  if (rows.length < 3) {
    return { message: 'Se necesitan al menos 3 registros para aplicar clustering.' };
  }

  // Codificar géneros como valores numéricos
  const generosUnicos = [...new Set(rows.map(r => r.genero))];
  const codificarGenero = g => generosUnicos.indexOf(g);
  const datos = rows.map(r => [r.precio, r.rating, codificarGenero(r.genero)]);

  // Normalizar datos
  const minPrecio = Math.min(...datos.map(d => d[0]));
  const maxPrecio = Math.max(...datos.map(d => d[0]));
  const minRating = Math.min(...datos.map(d => d[1]));
  const maxRating = Math.max(...datos.map(d => d[1]));

  const datosNormalizados = datos.map(d => [
    (d[0] - minPrecio) / (maxPrecio - minPrecio),
    (d[1] - minRating) / (maxRating - minRating),
    d[2]
  ]);

  // Aplicar K-Means con 3 clusters
  const resultado = mlKmeans.kmeans(datosNormalizados, 3);

  // Obtener valores originales de los precios en cada cluster
  const preciosCluster = rows.map((r, i) => ({
    precio: r.precio,
    cluster: resultado.clusters[i]
  }));

  // Calcular los rangos de precios usando percentiles
  const preciosOrdenados = preciosCluster.map(p => p.precio).sort((a, b) => a - b);
  const tercio1 = preciosOrdenados[Math.floor(preciosOrdenados.length / 3)];
  const tercio2 = preciosOrdenados[Math.floor((preciosOrdenados.length * 2) / 3)];

  function asignarGrupo(precio) {
    if (precio <= tercio1) return 'Bajo';
    if (precio <= tercio2) return 'Medio';
    return 'Caro';
  }

  // Asignar etiquetas a cada libro
  return rows.map((r, i) => ({
    ...r,
    grupo: asignarGrupo(r.precio)
  }));
}

module.exports = clusterizar;
