const nedb = require('nedb-promise');
const productsDB = new nedb({ filename: "products.db", autoload: true });
const menu = require("../menu.json");
const products = menu.menu;


function importProducts() {
  products.forEach((product) => {
    productsDB.insert({product: product});
  });
}

/* importProducts(); */

async function getProducts() {
    return await productsDB.find({});
}

module.exports = { importProducts, getProducts }