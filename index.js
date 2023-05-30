const express = require("express");
const { getProducts } = require("./database/products");
const { getUsers, addUser, checkUser, findUser, authenticate, updateUserHistory, isLoggedIn, getHistory } = require("./database/users");
const { hashPW } = require("./bcrypt");
const { checkOrders, saveOrders, getOrder } = require("./database/order");
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
        res.send({ success: true })
    } catch (error) {
        res.send({ message: 'Something went wrong'})
    }
});

// signup with a check if user check
app.post("/api/signup",checkUser, async (req, res) => {
  const { username, password } = req.body;
  const hashedPW = await hashPW(password);
  addUser(username, hashedPW);
  res.json({ success: true, message: "User was added" });
});

// check if orders are correct, and add it to a logged in user
app.post('/api/order', checkOrders, async (req, res) => {
    const orders = req.body.orders;
    const username = req.body.username;
    const date = new Date().toLocaleString();
    const loggedIn = await isLoggedIn(username);
    const orderNr = Math.floor(Math.random() * 1000)
    const orderStatus = false

    if(loggedIn) {
        updateUserHistory(username, orders, date, orderNr, orderStatus);
        //Add date
        res.send({success: true, message: "Your order has been made", order: orders })
    } else {
        res.send({ message: 'Your order has been made', order: orders})
    }
    saveOrders(orders, date, orderNr, orderStatus);
})

app.get('/api/user/history', async (req, res) => {
    const { username } = req.body;
    const userHistory = await getHistory(username);
    res.send(userHistory)
})

app.get('/api/status/:orderNr', async (req, res) => {
    const orderNr = req.params.orderNr
    //baserat på order nr hitta order
    const order = await getOrder(orderNr);
    console.log(order);

    function isDelivered(date1, date2) {
        const ms = Math.abs(Date.parse(date1) - Date.parse(date2));
        const minutes = Math.floor(ms / 60000);
        return minutes >= 20;
    }

    function getOrderStatus() {
        const time = order.date;
        console.log(time);
      
        const now = new Date();
        const isAtLeast20Minutes = isDelivered(time, now);
      
        return isAtLeast20Minutes;
    } 
})

app.listen(PORT, () => console.log("LIVE"));
