const express = require("express");
const { getProducts } = require("./database/products");
const {
  getUsers,
  addUser,
  checkUsername,
  checkUserId,
  findUser,
  authenticate,
  updateOrderHistory,
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
    res.send({
      success: true,
      menu: menu,
    });
  } catch (error) {
    res.status(error).send("Unable to load products");
  }
});

// get users from database
// app.get("/api/users", async (req, res) => {
//   try {
//     const users = await getUsers();
//     res.send(users);
//   } catch (error) {
//     res.status(error).send("Unable to find users");
//   }
// });

// signup with a check if user check
app.post("/api/user/signup", checkUsername, async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPW = await hashPW(password);
    addUser(username, hashedPW);
    res.send({ success: true, message: "User was added" });
  } catch (error) {
    res.send({ sucess: false, message: "Something went wrong" });
  }
});

// login with a check if user and password exist
app.post("/api/user/login", findUser, authenticate, async (req, res) => {
  try {
    res.send({ success: true, message: "You are now logged in" });
  } catch (error) {
    res.send({ sucess: false, message: "Something went wrong" });
  }
});

// check if orders are correct, and add it to a logged in user.
// The order will also be addded to the order database
app.post("/api/order", checkOrders, async (req, res) => {
  try {
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
      updateOrderHistory(username, order, date, ETA, orderNr, totalPrice);
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
  } catch (error) {
    res.send({
      sucess: false,
      message: "Something went wrong with your order",
    });
  }
});

app.get("/api/user/history", checkUserId, async (req, res) => {
  try {
    const { userId } = req.body;
    const userHistory = await getHistory(userId);
    res.send({
      success: true,
      orderHistory: userHistory,
    });
  } catch (error) {
    res.send({
      sucess: false,
      message: "Something went wrong when trying to get your order history",
    });
  }
});

app.get("/api/order/status/:orderNr", checkOrderNr, async (req, res) => {
  try {
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
  } catch (error) {
    res.send({
      sucess: false,
      message: "Something went wrong when trying to get your order",
    });
  }
});

app.listen(PORT, () => console.log("LIVE"));
