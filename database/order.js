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

  ordersDB.update(
    { "order.orderNr": orderNr },
    { $set: { "order.status": isDelivered } }
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
      (product.product.price !== price && product.product.title !== title)
    ) {
      res.send("Price or title is wrong");
    } else {
      orderList.push(order);
    }
  });

  if (orderList.length === order.length) {
    next();
  } else {
    res.send("something went wrong");
  }
}

async function saveOrders(order, date, ETA, orderNr, orderStatus, totalPrice) {
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

  if (order === undefined) {
    res.send("No order was found with that order number");
  } else {
    next();
  }
}

module.exports = { checkOrders, saveOrders, getOrder, checkOrderNr };
