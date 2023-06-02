const express = require("express");

const { getProducts } = require("./model/products");
const {
  addUser,
  checkUsername,
  checkUserId,
  findUser,
  authenticate,
  updateOrderHistory,
  isLoggedIn,
  getHistory,
} = require("./model/users");
const {
  checkOrders,
  saveOrders,
  getOrder,
  checkOrderNr,
} = require("./model/order");
const { hashPW } = require("./utils/bcrypt");

const app = express();
const PORT = 9090;

app.use(express.json());

// Get products from database
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

// Sign up with a middleware that check if there already exists a user with that username
// Password will be hashed
app.post("/api/user/signup", checkUsername, async (req, res) => {
  const { username, password } = req.body;
  const hashedPW = await hashPW(password);
  addUser(username, hashedPW);
  res.send({ success: true, message: "User was added" });
});

// Login with middleware that first check if the username exists and the if the password is correct
app.post("/api/user/login", findUser, authenticate, async (req, res) => {
  res.send({ success: true, message: "You are now logged in" });
});

// Middleware to check if the request parameters matches the database.
// If correct it will be added to a logged in users order history.
// The order will also be added to the order database.
app.post("/api/order", checkOrders, async (req, res) => {
  const order = req.body.order;
  const username = req.body.username;

  // Calculates the totalprice
  let totalPrice = 0;
  order.forEach((item) => {
    totalPrice = totalPrice + item.price;
  });

  // Function for order status
  const date = new Date();
  const ETA = new Date(date.getTime());
  ETA.setMinutes(ETA.getMinutes() + 20);

  const orderStatus = "Not delivered";

  // A random ordernr will be generated
  const orderNr = Math.floor(Math.random() * 1000);

  const loggedIn = await isLoggedIn(username);
  if (loggedIn) {
    // Storing the order to the users order history
    updateOrderHistory(username, order, date, ETA, orderNr, totalPrice);
  }

  // Storing all orders, both for guests and users, in the orders database
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

// A middleware checks if the user id is correct and/or exists
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

// Middleware that checks if there is an order with the given order number.
app.get("/api/order/status/:orderNr", checkOrderNr, async (req, res) => {
  const orderNr = parseInt(req.params.orderNr, 10);

  //When getting the order the order status will also be updated.
  const order = await getOrder(orderNr);
  const orderStatus = order.order.status;
  const ETA = order.order.ETA;

  if (orderStatus) {
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
