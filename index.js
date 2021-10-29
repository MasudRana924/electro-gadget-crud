const express = require('express')
const { MongoClient, CURSOR_FLAGS } = require('mongodb');
const ObjectId=require('mongodb').ObjectId
const cors = require('cors');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000
// middleware 
app.use(cors())
app.use(express.json())
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hrpwo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect()
        const database = client.db('electroGadget')
        // products connection
        const productsCollection = database.collection('products')
        // order connection
        const ordersCollection = database.collection('orders')
        // get api for all data 
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({})
            const page = req.query.page
            const size = parseInt(req.query.size)
            let products;
            const count = await cursor.count()
            if (page) {
                products = await cursor.skip(page * size).limit(size).toArray()
            }
            else {
                const products = await cursor.toArray()
            }
            res.send({
                count, products
            })
        })
        //    get single data 
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const product = await productsCollection.findOne(query)
            res.json(product)
        })
        // post api keys e data pawar jonno
        app.post('/products/bykeys', async (req, res) => {
            console.log(req.body)
            const keys = req.body
            const query = { key: { $in: keys } }
            const products = await productsCollection.find(query).toArray()
            res.json(products)

        })
        // orders 
        app.post('/orders', async (req, res) => {
            const order = req.body
            const result = await ordersCollection.insertOne(order)
            res.json(result)
        })
        // get from orders
        app.get('/orders',async(req,res)=>{
            const cursor = ordersCollection.find({})
            const orders = await cursor.toArray()
            res.send(orders)
        })
         //  single orders id
         app.get('/orders/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const user = await ordersCollection.findOne(query)

            console.log(id)
            res.send(user)
        })
        // post 
        app.post('/products', async (req, res) => {
            const newProduct = req.body
            const result = await productsCollection.insertOne(newProduct)
            console.log('got new user  ', req.body)
            console.log('added user', result)
            // res.send('hit the post')
            res.json(result)
        })
        // delete 
         //  delete api 
         app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await ordersCollection.deleteOne(query)
            res.json(result)
        })


    }
    finally {

    }
}

run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('Electro-gadget is running under server')
})
app.listen(port, () => {
    console.log("server is running on", port)
})