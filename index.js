const express = require("express");
const { getProducts } = require("./database/products");
const {
  addUser,
  checkUsername,
  checkUserId,
  findUser,
  authenticate,
  updateOrderHistory,
  isLoggedIn,
  getHistory,
} = require("./database/users");
const {
  checkOrders,
  saveOrders,
  getOrder,
  checkOrderNr,
} = require("./database/order");
const { hashPW } = require("./bcrypt");
const app = express();
app.use(express.json());
const PORT = 9090;

// get products from json
app.get("/api/menu", async (req, res) => {
  try {
    const menu = await getProducts();
    res.send({
      success: true,
      menu: menu,
    });
  } catch (error) {
    res
      .status(404)
      .send({ success: false, message: "Unable to load products" });
  }
});

// signup with a check if user check
app.post("/api/user/signup", checkUsername, async (req, res) => {
  const { username, password } = req.body;
  const hashedPW = await hashPW(password);
  addUser(username, hashedPW);
  res.send({ success: true, message: "User was added" });
});

// login with a check if user and password exist
app.post("/api/user/login", findUser, authenticate, async (req, res) => {
  res.send({ success: true, message: "You are now logged in" });
});

// check if orders are correct, and add it to a logged in user.
// The order will also be added to the order database
app.post("/api/order", checkOrders, async (req, res) => {
  const order = req.body.order;
  const username = req.body.username;

  let totalPrice = 0;
  order.forEach((item) => {
    totalPrice = totalPrice + item.price;
  });

  // Function for order status
  const date = new Date();
  const ETA = new Date(date.getTime());
  ETA.setMinutes(ETA.getMinutes() + 20);

  const loggedIn = await isLoggedIn(username);
  const orderNr = Math.floor(Math.random() * 1000);
  const orderStatus = false;

  if (loggedIn) {
    // storing order to user
    updateOrderHistory(
      username,
      order,
      date,
      ETA,
      orderNr,
      orderStatus,
      totalPrice
    );
  }
  // storing all orders in orders.db
  saveOrders(order, date, ETA, orderNr, orderStatus, totalPrice);

  res.send({
    success: true,
    message: "Your order is on its way",
    ETA: ETA,
    orderNr: orderNr,
    totalPrice: totalPrice,
    order: order,
  });
});

app.get("/api/user/history", checkUserId, async (req, res) => {
  const { userId } = req.body;
  const userHistory = await getHistory(userId);
  if (userHistory) {
    res.send({
      success: true,
      orderHistory: userHistory,
    });
  } else {
    res
      .status(404)
      .send({ success: false, orderHistory: "No order history found" });
  }
});

app.get("/api/order/status/:orderNr", checkOrderNr, async (req, res) => {
  const orderNr = parseInt(req.params.orderNr, 10);
  const order = await getOrder(orderNr);
  const status = order.order.status;
  const ETA = order.order.ETA;

  if (status) {
    res.send({
      message: "Your order has been delivered",
      ETA: ETA,
    });
  } else {
    res.send({
      message: "Your order is on it's way",
      ETA: ETA,
    });
  }
});

app.listen(PORT, () => console.log("LIVE"));
