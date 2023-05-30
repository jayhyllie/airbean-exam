const nedb = require("nedb-promise");
const usersDB = new nedb({ filename: "users.db", autoload: true });
const { comparePW } = require("../bcrypt");

async function getUsers() {
  return await usersDB.find({});
}

async function addUser(username, password) {
  usersDB.insert({ username: username, password: password });
}

async function findUser(req, res, next) {
  const { username } = req.body;
  const user = await usersDB.findOne({ username: username });
  if (user) {
    next();
  } else {
    res.status(400).send("Incorrect username");
  }
}

async function authenticate(req, res, next) {
  const { username, password } = req.body;
  const user = await usersDB.findOne({ username: username });
  const pwExist = await comparePW(password, user.password);
  if (pwExist) {
    usersDB.update({ username: username}, { $push: { isLoggedIn: true }});
    next();
  } else {
    res.send({ message: "Incorrect password" });
  }
}

async function checkUser(req, res, next) {
  const { username } = req.body;
  const user = await usersDB.findOne({ username: username });
  if (user) {
    res.status(400).send("User already exists");
  } else {
    next();
  }
}

async function isLoggedIn(username) {
    const user = await usersDB.findOne({ username: username });
    if (user.isLoggedIn) {
        return true;
    } else {
        return false;
    }
}

async function updateUserHistory(username, order, date, orderNr, orderStatus) {
    orderObj = {
        items: order,
        date: date,
        orderNr: orderNr,
        status: orderStatus
    }
    usersDB.update({ username: username }, { $push: { orders: { order: orderObj }}});
}

async function getHistory(username) {
    const user = await usersDB.findOne({ username: username});
    const orderHistory = user.orders;
    return orderHistory;
}


module.exports = {
  getUsers,
  addUser,
  checkUser,
  findUser,
  authenticate,
  isLoggedIn,
  updateUserHistory,
  getHistory
};
