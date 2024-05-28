const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// Middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yuxa2nd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const coffeeCollection = client.db('coffeeDB').collection('coffee');
    const userCollection = client.db('coffeeDB').collection('users');

    // Add a new coffee in database to the client
    app.post('/coffee', async (req, res) => {
      const newCoffee = req.body;
      console.log('adding new coffee:', newCoffee);
      const result = await coffeeCollection.insertOne(newCoffee);
      res.send(result);
    })

    // List all coffees in the database
    app.get('/coffee', async (req, res) => {
      const cursor = coffeeCollection.find({});
      const result = await cursor.toArray();
      res.send(result);
    })

    // Get a coffee from the database
    app.get('/coffee/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffeeCollection.findOne(query);
      res.send(result);
    })

    // Delete a coffee from the database
    app.delete('/coffee/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffeeCollection.deleteOne(query);
      res.send(result);
    })

    // Update a coffee in the database
    app.put('/coffee/:id', async (req, res) => {
      const id = req.params.id;
      const updateCoffee = req.body;
      const query = { _id: new ObjectId(id) };
      const option = { upsert: true };
      const updateDoc = {
        $set: {
          coffeeName: updateCoffee.coffeeName,
          price: updateCoffee.price,
          supplier: updateCoffee.supplier,
          taste: updateCoffee.taste,
          category: updateCoffee.category,
          details: updateCoffee.details,
          photoUrl: updateCoffee.photoUrl
        }
      }
      const result = await coffeeCollection.updateOne(query, updateDoc, option);
      res.send(result);
    })

    // User Related APIs

    // Add a new user in database to the client
    app.post('/users', async (req, res) => {
      const newUser = req.body;
      console.log('adding new user:', newUser);
      const result = await userCollection.insertOne(newUser);
      res.send(result);
    })

    // List all users in the database
    app.get('/users', async (req, res) => {
      const cursor = userCollection.find({});
      const result = await cursor.toArray();
      res.send(result);
    })

    // Delete user
    app.delete('/users/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });

    // Update user
    app.put('/users/:id', async (req, res) => {
      const id = req.params.id;
      const updateUser = req.body;
      const query = { _id: new ObjectId(id) };
      const option = { upsert: true };
      const updateDoc = {
        $set: {
          name: updateUser.name,
          email: updateUser.email,
          createAt: updateUser.createAt,
          lastSignInTime: updateUser.lastSignInTime,
        }
      };
      const result = await userCollection.updateOne(query, updateDoc, option);
      res.send(result);
    });

    app.patch('/users', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = {
        $set: {
          lastSignInTime: user.lastSignInTime,
        }
      }
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    });



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


// Routes
app.get('/', (req, res) => {
  res.send("Coffee Making server is rinnning");
});


app.listen(port, () => {
  console.log(`Coffee server is running on port ${port}`);
});