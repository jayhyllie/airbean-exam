const { getProducts } = require("./products");
const nedb = require("nedb-promise");
const ordersDB = new nedb({ filename: "orders.db", autoload: true });

async function getOrder(orderNr) {
    return await ordersDB.findOne({orderNr: orderNr})
}

async function checkOrders(req, res, next) {
    const orderList = [];
    const products = await getProducts();
    const orders = req.body.orders;
    console.log(orders);
    orders.forEach(order => {
        const id = order.id;
        const price = order.price;
        const title = order.title;
        const product = products.find(product => product._id === id);
        if(!product || product.product.price !== price && product.product.title !== title ) {
            res.send("Price or title is wrong")
        } else {
            orderList.push(order)
        }
    })

    if(orderList.length === orders.length) {
        next()
    } else {
        res.send("something went wrong")
    } 
}

async function saveOrders(order, date, orderNr, orderStatus) {
    orderObj = {
        items: order,
        date: date,
        orderNr: orderNr,
        status: orderStatus
    }
    ordersDB.insert({ orders: { order: orderObj }});
}

module.exports = { checkOrders, saveOrders, getOrder }

