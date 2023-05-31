const nedb = require("nedb-promise");
const usersDB = new nedb({ filename: "users.db", autoload: true });
const { comparePW } = require("../bcrypt");

// async function getUsers() {
//   return await usersDB.find({});
// }

function addUser(username, password) {
  usersDB.insert({ username: username, password: password });
}

async function findUser(req, res, next) {
  const { username } = req.body;
  const user = await usersDB.findOne({ username: username });
  if (user) {
    next();
  } else {
    res.status(400).send({ message: "Incorrect username" });
  }
}

async function authenticate(req, res, next) {
  const { username, password } = req.body;
  const user = await usersDB.findOne({ username: username });
  const pwExist = await comparePW(password, user.password);
  if (pwExist) {
    usersDB.update({ username: username }, { $push: { isLoggedIn: true } });
    next();
  } else {
    res.status(400).send({ message: "Incorrect password" });
  }
}

async function checkUsername(req, res, next) {
  const { username } = req.body;
  const user = await usersDB.findOne({ username: username });
  if (user) {
    res.status(400).send({ message: "User already exists" });
  } else {
    next();
  }
}

async function checkUserId(req, res, next) {
  const { userId } = req.body;
  const user = await usersDB.findOne({ _id: userId });
  if (user) {
    next();
  } else {
    res.status(400).send({ message: "No user with that user id" });
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

function updateOrderHistory(username, order, date, ETA, orderNr, totalPrice) {
  orderObj = {
    orderNr: orderNr,
    totalPrice: totalPrice,
    date: date,
    ETA: ETA,
    items: order,
  };
  usersDB.update(
    { username: username },
    { $push: { orders: { order: orderObj } } }
  );
}

async function getHistory(userId) {
  const user = await usersDB.findOne({ _id: userId });
  const orderHistory = user.orders;
  return orderHistory;
}

module.exports = {
  addUser,
  checkUsername,
  checkUserId,
  findUser,
  authenticate,
  isLoggedIn,
  updateOrderHistory,
  getHistory,
};
