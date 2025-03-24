const axios = require('axios');
const cheerio = require('cheerio');

async function obtenerGenero(url) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    return $('ul.breadcrumb li:nth-child(3) a').text().trim() || 'Default';
  } catch {
    return 'Default';
  }
}

async function obtenerLibros() {
  const libros = [];
  const ratingMap = { 'One': 1, 'Two': 2, 'Three': 3, 'Four': 4, 'Five': 5 };

  for (let i = 1; i <= 3; i++) {
    const url = `https://books.toscrape.com/catalogue/page-${i}.html`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const items = $('.product_pod');

    for (let j = 0; j < items.length; j++) {
      const el = items[j];
      const titulo = $(el).find('h3 a').attr('title');
      const enlaceRelativo = $(el).find('h3 a').attr('href');
      const enlaceAbsoluto = `https://books.toscrape.com/catalogue/${enlaceRelativo.replace('../', '')}`;
      const precioTexto = $(el).find('.price_color').text();
      const precio = parseFloat(precioTexto.replace('£', ''));
      const ratingTexto = $(el).find('.star-rating').attr('class').split(' ')[1];
      const rating = ratingMap[ratingTexto] || 0;
      const genero = await obtenerGenero(enlaceAbsoluto);

      libros.push({ titulo, precio, rating, genero });
    }

    await new Promise(res => setTimeout(res, 500));
  }

  return libros;
}

module.exports = obtenerLibros;
