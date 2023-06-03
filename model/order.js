const nedb = require("nedb-promise");

const { getProducts } = require("./products");

// Creates the order database.
const ordersDB = new nedb({ filename: "orders.db", autoload: true });

// This function will update the order status when a status request of a certain order is made.
async function updateOrderStatus(orderNr) {
  const order = await ordersDB.findOne({ "order.orderNr": orderNr });

  const ETA = order.order.ETA;
  const formattedETA = ETA.replace(",", " ");
  const ETAdate = new Date(formattedETA);
  const currentDate = new Date();
  // Checks if ETA has passed.
  const isDelivered = ETAdate < currentDate;

  // The order status is then updated in the order database.
  ordersDB.update(
    { "order.orderNr": orderNr },
    { $set: { "order.status": isDelivered } }
  );
}

// When getting an order from the database, it will first be updated with correct order status.
async function getOrder(orderNr) {
  await updateOrderStatus(orderNr);
  return await ordersDB.findOne({ "order.orderNr": orderNr });
}

// Middleware for when an order request is made. Checks if product id, price and title are correct.
// If one of the products are added incorrect it will respond with a status of 400.
// Otherwise if all of the products are correct it will pass to next.
async function checkOrders(req, res, next) {
  const orderList = [];
  const products = await getProducts();
  const order = req.body.order;
  order.forEach((order) => {
    const id = order._id;
    const price = order.price;
    const title = order.title;
    const product = products.find((product) => product._id === id);
    if (
      !product ||
      product.product.price !== price ||
      product.product.title !== title
    ) {
      res.status(400).send({ success: false, message: "Product not found" });
    } else {
      orderList.push(order);
    }
  });

  if (orderList.length === order.length) {
    next();
  }
}

// This function will save an order to the order database.
function saveOrders(order, date, ETA, orderNr, orderStatus, totalPrice) {
  orderObj = {
    orderNr: orderNr,
    status: orderStatus,
    date: date.toLocaleString(),
    ETA: ETA.toLocaleString(),
    totalPrice: totalPrice,
    items: order,
  };
  ordersDB.insert({ order: orderObj });
}

// Middleware that checks if there is an order with the given order number.
async function checkOrderNr(req, res, next) {
  const orderNr = parseInt(req.params.orderNr, 10);
  const orders = await ordersDB.find({});
  const order = orders.find((order) => order.order.orderNr === orderNr);
  if (!order) {
    res.status(404).send({
      success: false,
      message: "No order was found with that order number",
    });
  } else {
    next();
  }
}

module.exports = { checkOrders, saveOrders, getOrder, checkOrderNr };
