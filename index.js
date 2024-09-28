const express = require('express')
const { MongoClient } = require('mongodb');
require('dotenv').config()
const cors = require('cors')
const ObjectId = require('mongodb').ObjectId
const app = express()
const port = process.env.PORT || 5000



app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.egg9z.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {

    try {

        await client.connect()
        console.log('connections established')

        const database = client.db('Glossy-lips-database')
        const usersCollection = database.collection('users')
        const productsCollection = database.collection('products')
        const ordersCollection = database.collection('orders')
        const reviewsCollection = database.collection('reviews')

        app.post('/users', async (req, res) => {
            const user = req.body
            const result = await usersCollection.insertOne(user)
            res.json(result)
        })
        app.post('/orders', async (req, res) => {
            const order = req.body
            const result = await ordersCollection.insertOne(order)
            res.json(result)
        })
        app.post('/product', async (req, res) => {
            const product = req.body
            const result = await productsCollection.insertOne(product)
            res.json(result)
        })

        app.put('/review', async (req, res) => {
            const review = req.body
            const filter = { productId: review.productId, raterEmail: review.raterEmail }
            const options = { upsert: true };
            const updateDoc = {
                $set: review
            }
            const result = await reviewsCollection.updateOne(filter, updateDoc, options);
            res.json(result)

        })

        app.put('/users', async (req, res) => {
            const user = req.body
            const filter = { email: user.email }
            const options = { upsert: true };
            const updateDoc = {
                $set: user
            }
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result)

        })

        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: ObjectId(id) }
            const updateDoc = {
                $set: { status: 'confirmed' }
            }
            const result = await ordersCollection.updateOne(filter, updateDoc);
            res.json(result)

        })


        app.get('/orders', async (req, res) => {
            const query = { email: req.query.email }
            const cursor = ordersCollection.find(query)
            orders = await cursor.toArray()
            res.json(orders)
        })
        app.get('/orders/admin', async (req, res) => {
            const cursor = ordersCollection.find({})
            orders = await cursor.toArray()
            res.json(orders)
        })

        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            res.json(result)
        })

        app.get('/review', async (req, res) => {
            const limit = parseInt(req.query.limit)
            const cursor = reviewsCollection.find({})
            products = await cursor.limit(limit).toArray()
            res.json(products)
        })

        app.get('/products', async (req, res) => {
            const limit = parseInt(req.query.limit)
            const cursor = productsCollection.find({})
            if (limit) {
                products = await cursor.limit(limit).toArray()
            } else {
                products = await cursor.toArray()
            }
            res.json(products)
        })

        app.get('/users', async (req, res) => {
            const cursor = usersCollection.find({})
            const users = await cursor.toArray()
            res.json(users)
        })

        app.put('/users/admin', async (req, res) => {
            const id = req.body._id
            const user = req.body
            let newRole = ''
            if (user.role === 'user') {
                newRole = 'admin'
            } else { newRole = 'user' }
            const query = { _id: ObjectId(id) };
            const updateDoc = {
                $set: { role: newRole }
            }
            const result = await usersCollection.updateOne(query, updateDoc);
            res.json(result)

        })

        app.get('/products/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) };
            const product = await productsCollection.findOne(query)
            res.send(product)
        })

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const user = await usersCollection.findOne(query)
            let isAdmin = false
            if (user?.role == 'admin') {
                isAdmin = true
            }
            res.json({ admin: isAdmin })
        })
    } finally {
        //await client.close
    }
}




app.get('/', (req, res) => {
    res.send('Glossy Lips Server up')
})

app.listen(port, () => {
    console.log(`listening at ${port}`)
})

run().catch(console.dir)