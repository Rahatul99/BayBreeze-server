const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());


//mongo

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jp6ok1r.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();


    const toysCollection = client.db('toysDB').collection('categories');
    const addedToys = client.db('toysDB').collection('addtoy');

    app.get('/categories', async(req, res) => {
      const result = await toysCollection.find().toArray();
      res.send(result);
    })

    app.get('/categories/:id/:sub_id', async (req, res) => {
      try {
        const id = req.params.id;
        const sub_id = req.params.sub_id;
    
        const query = { _id: new ObjectId(id) };
        const result = await toysCollection.findOne(query);
    
        if (!result) {
          res.status(404).send('No ID found');
          return;
        }
    
        const toy = result.toys.find(toy => toy.sub_id === sub_id);
        if (!toy) {
          res.status(404).send('No sub_id found');
          return;
        }
    
        res.send(toy);
      } catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occurred');
      }
    });
    
    //***************************************//
    app.post("/addtoy", async (req, res) => {
      const body = req.body;
      if (!body) {
        return res.status(404).send({ message: 'data not found' });
      }
      const result = await addedToys.insertOne(body);
      console.log(result);
    
      res.send(result);
    });
    

    app.get("/allToys", async(req, res) => {
      const result = await addedToys.find({}).toArray();
      res.send(result);
    })

    app.get('/mytoys/:email', async (req, res) => {
      const email = req.params.email;
      console.log('Requested email:', email);
    
      try {
        const toys = await addedToys.find({ email }).toArray();
        console.log('Toys found:', toys);
    
        res.send(toys);
      } catch (error) {
        console.error('Error retrieving toys:', error);
        res.status(500).send('An error occurred');
      }
    });

    //*********************************//

    
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

    // await client.close();
  }
}
run().catch(console.dir);
//mongo
app.get('/', (req, res) => {
    res.send('toy market place')
})

app.listen(port, () => {
    console.log(`toy market place is running on port: ${port}`);
})