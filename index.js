const express = require("express");
const { getProducts } = require("./database/products");
const {
  getUsers,
  addUser,
  checkUser,
  findUser,
  authenticate,
  updateUserHistory,
  isLoggedIn,
  getHistory,
} = require("./database/users");
const { hashPW } = require("./bcrypt");
const {
  checkOrders,
  saveOrders,
  getOrder,
  checkOrderNr,
} = require("./database/order");
const app = express();
app.use(express.json());
const PORT = 9090;

// get products from json
app.get("/api/menu", async (req, res) => {
  try {
    const menu = await getProducts();
    res.send(menu);
  } catch (error) {
    res.status(error).send("Unable to load products");
  }
});

// get users from database
app.get("/api/users", async (req, res) => {
  try {
    const users = await getUsers();
    res.send(users);
  } catch (error) {
    res.status(error).send("Unable to find users");
  }
});

// login with a check if user and password exist
app.post("/api/login", findUser, authenticate, async (req, res) => {
  try {
    res.send({ success: true });
  } catch (error) {
    res.send({ message: "Something went wrong" });
  }
});

// signup with a check if user check
app.post("/api/signup", checkUser, async (req, res) => {
  const { username, password } = req.body;
  const hashedPW = await hashPW(password);
  addUser(username, hashedPW);
  res.json({ success: true, message: "User was added" });
});

// check if orders are correct, and add it to a logged in user.
// The order will also be addded to the order database
app.post("/api/order", checkOrders, async (req, res) => {
  const order = req.body.order;
  const username = req.body.username;

  let totalPrice = 0;
  order.forEach((item) => {
    totalPrice = totalPrice + item.price;
  });

  // Funktion för tid
  const date = new Date();
  const ETA = new Date(date.getTime());
  ETA.setMinutes(ETA.getMinutes() + 20);

  const loggedIn = await isLoggedIn(username);
  const orderNr = Math.floor(Math.random() * 1000);
  const orderStatus = false;

  if (loggedIn) {
    updateUserHistory(username, order, date, ETA, orderNr, totalPrice);
  }
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

app.get("/api/user/history", findUser, async (req, res) => {
  const { username } = req.body;
  const userHistory = await getHistory(username);
  res.send({
    success: true,
    orderHisstory: userHistory,
  });
});

app.get("/api/status/:orderNr", checkOrderNr, async (req, res) => {
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
