const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1v2bc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {

      try {
          await client.connect();
          const inventoryCollection = client.db('motorMania').collection('user');
          const myItemCollection = client.db('motorMania').collection('myItem');

          app.post ('/login', async (req, res) => {
              const user = req.body;
              const jwtToken = jwt.sign(user, process.env.JWT_TOKEN_SECRET, {
                expiresIn: '2d'
              })
              res.send({jwtToken});
          })

          app.get('/inventory', async(req, res) => {
            const query = {};
            const cursor = inventoryCollection.find(query);
            const inventories = await cursor.toArray();
            res.send(inventories);
          });

          app.get ('/inventory/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const inventory = await inventoryCollection.findOne(query);
            res.send(inventory);
          });

          app.post ('/myitem', async (req, res) => {
            const myNewItem = req.body;
            const result = await myItemCollection.insertOne(myNewItem);
            res.send(result);
          });

          app.get('/myitem', async(req, res) => {
            const email = req.query.email;
            const query = {email: email};
            const cursor = myItemCollection.find(query);
            const addItem = await cursor.toArray();
            res.send(addItem);
          }) 

          app.post('/inventory', async(req, res) => {
            const newInventory = req.body;
            const result = await inventoryCollection.insertOne(newInventory);
            res.send(result);
          });

          app.delete('/inventory/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await inventoryCollection.deleteOne(query);
            res.send(result);
          });

          app.delete('/myitem/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await myItemCollection.deleteOne(query);
            res.send(result);
          });
      }

      finally {

      }

}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Running Motor Mania Server!');
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});