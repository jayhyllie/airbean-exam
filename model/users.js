const nedb = require("nedb-promise");

const { comparePW } = require("../utils/bcrypt");

// Creates a users database.
const usersDB = new nedb({ filename: "users.db", autoload: true });

// Function for adding a new user to the user database.
function addUser(username, password) {
  usersDB.insert({ username: username, password: password });
}

// Middleware that checks if the given username already exists when trying to add a new user.
async function checkUsername(req, res, next) {
  const { username } = req.body;
  const user = await usersDB.findOne({ username: username });
  if (user) {
    res.status(409).send({ message: "User already exists" });
  } else {
    next();
  }
}

// Middleware that checks if the given username is correct when trying to login.
async function findUser(req, res, next) {
  const { username } = req.body;
  const user = await usersDB.findOne({ username: username });
  if (user) {
    next();
  } else {
    res.status(404).send({ message: "Incorrect username" });
  }
}

// Middleware that checks if the given password is correct.
// If yes then the user will be logged in and a new property will be added.
async function authenticate(req, res, next) {
  const { username, password } = req.body;
  const user = await usersDB.findOne({ username: username });
  const pwExist = await comparePW(password, user.password);
  if (pwExist) {
    usersDB.update({ username: username }, { $push: { isLoggedIn: true } });
    next();
  } else {
    res.status(401).send({ message: "Incorrect password" });
  }
}

// Function that checks if the user is logged in.
async function isLoggedIn(username) {
  const user = await usersDB.findOne({ username: username });
  if (user) {
    if (user.isLoggedIn) {
      return true;
    } else {
      return false;
    }
  }
}

// Function that updates a users order history.
// Only if the user is logged in.
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

// Middleware that checks if the given user id exists.
async function checkUserId(req, res, next) {
  const { userId } = req.body;
  const user = await usersDB.findOne({ _id: userId });
  if (user) {
    next();
  } else {
    res.status(401).send({ message: "User not logged in" });
  }
}

// Function that gets a users order hitory based on a user id.
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
