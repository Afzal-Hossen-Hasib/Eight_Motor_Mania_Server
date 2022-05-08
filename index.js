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

function verifyJWT (req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({message: 'Access Denied'})
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({message: 'Forbidden Access'}); 
    }
    console.log('Decoded', decoded); 
    req.decoded = decoded;
    next();
  })
}

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

          app.get('/myitem', verifyJWT, async(req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            if (email === decodedEmail) {
              const query = {email: email};
              const cursor = inventoryCollection.find(query);
              const addItem = await cursor.toArray();
              res.send(addItem);
            } 
            else {
              res.status(403).send({message: 'Forbidden Access'}); 
            }
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
            const result = await inventoryCollection.deleteOne(query);
            res.send(result);
          });

          app.put('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const updateQuantity = req.body;
            const filter = {_id: ObjectId(id)};
            const options = {upsert: true};
            const updatedDoc = {
              $set: {
                quantity: updateQuantity.quantity
              }
            }  
            const result = await inventoryCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
          })
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