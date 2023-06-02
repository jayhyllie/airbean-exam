const { getProducts } = require("./products");
const nedb = require("nedb-promise");
const ordersDB = new nedb({ filename: "orders.db", autoload: true });

async function updateOrderStatus(orderNr) {
  const order = await ordersDB.findOne({ "order.orderNr": orderNr });

  const ETA = order.order.ETA;
  const formattedETA = ETA.replace(",", " ");
  const ETAdate = new Date(formattedETA);
  const currentDate = new Date();
  const isDelivered = ETAdate < currentDate;
  let status = "";
  if (isDelivered) {
    status = "Delivered";
  } else {
    status = "Not delivered";
  }
  ordersDB.update(
    { "order.orderNr": orderNr },
    { $set: { "order.status": status } }
  );
}

async function getOrder(orderNr) {
  await updateOrderStatus(orderNr);
  return await ordersDB.findOne({ "order.orderNr": orderNr });
}

async function checkOrders(req, res, next) {
  const orderList = [];
  const products = await getProducts();
  const order = req.body.order;
  order.forEach((order) => {
    const id = order.id;
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
