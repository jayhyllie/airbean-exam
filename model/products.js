const nedb = require("nedb-promise");

// Creates a product database.
const productsDB = new nedb({ filename: "products.db", autoload: true });
// Import of json file with menu
const menu = require("../utils/menu.json");
const products = menu.menu;

// A one time function that imports the menu from the json file and adds it to the database
function importProducts() {
  products.forEach((product) => {
    productsDB.insert({ product: product });
  });
}

/* importProducts(); */ // Calling the function one time to fill the products database.

// Function to get all products from the products database.
async function getProducts() {
  return await productsDB.find({});
}

module.exports = { importProducts, getProducts };
