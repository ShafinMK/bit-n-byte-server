const express = require('express')
const app = express()
var cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
require('dotenv').config()
var jwt = require('jsonwebtoken');

//db user name and pass

//un: shafin
//upass: D9rLmZHnXxYNKbK3



//middleware 
app.use(cors());
app.use(express.json({
  origin: 'https://bit-n-byte.web.app'
}));

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: 'Unauthorized Access' });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: 'Forbidden Access' })
    }
    console.log('decoded', decoded);
    req.decoded = decoded;
  })

  next();
}

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASSWORD}@bit-n-byte.qvrh1qr.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
  try {
    const database = client.db('bit-n-byte');
    const products_collection = database.collection('products');
    const blogs_collection = database.collection('blogs');

    //Auth with token
    app.post('/login', async (req, res) => {
      const user = req.body;
      // console.log(user);
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1d'
      });
      res.send({ accessToken });
    })

    // show all products of inventory
    app.get('/products', async (req, res) => {
      // console.log('getting all products');
      const cursor = products_collection.find({});
      const result = await cursor.toArray();
      res.send(result);
    })

    // show searched products from inventory
    app.get('/searchedproducts', async (req, res) => {
      // console.log('getting all products');
      const cursor = products_collection.find({ "itemName": /Motherboard/ });
      const result = await cursor.toArray();
      res.send(result);
    })




    //show random 6 items from products collection
    app.get('/homepageproducts', async (req, res) => {
      const cursor = products_collection.aggregate([{ $sample: { size: 6 } }]);
      const result = await cursor.toArray();
      res.send(result);
    })

    // show all blogs
    app.get('/blogs', async (req, res) => {
      // console.log('getting all blogs');
      const cursor = blogs_collection.find({});
      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size);
      let blogs;
      if(page || size){
        blogs = await cursor.skip(page*size).limit(size).toArray();
      }
      else{
        blogs = await cursor.toArray();
      }
      // const result = await cursor.toArray();
      res.send(blogs);
    })

    //get blogs count
    app.get('/blogscount', async(req, res)=>{
      
      const count = await blogs_collection.estimatedDocumentCount();
      res.send({count});
    })

    //show random 3 blogs
    app.get('/randomblogs', async (req, res) => {
      // console.log('getting all blogs');
      const cursor = blogs_collection.aggregate([{ $sample: { size: 4 } }]);
      const result = await cursor.toArray();
      res.send(result);
    })

    //find a product
    app.get('/products/:productID', async (req, res) => {
      // console.log('getting one product');
      const productId = req.params.productID;
      const query = { _id: ObjectId(productId) }
      const searchedItem = await products_collection.findOne(query);
      // console.log(searchedItem);
      res.send(searchedItem);
    })

    //find my products
    app.get('/vendorsproduct', verifyJWT, async (req, res) => {
      const email = req.query.vendoremail;
      const decodedEmail = req.decoded.email;
      if (email === decodedEmail) {
        const query = { vendorEmail: email };
        const cursor = products_collection.find(query);
        const result = await cursor.toArray();
        res.send(result);
      }
      else {
        res.status(403).send({ message: 'forbidden access' });
      }

    })

    // find stock out items 
    app.get('/stockoutitems', async (req, res) => {
      // const vendor = req.query.vendorname;
      const query = { itemInStock: 0 };
      const cursor = products_collection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })

    //add new product
    app.post('/products', async (req, res) => {
      // console.log('hitting the products');
      const newProduct = req.body;
      const result = await products_collection.insertOne(newProduct);
      console.log(req.body);
      res.send(result);
    });
    //add new blog
    app.post('/blogs', async (req, res) => {
      // console.log('hitting the blogs');
      const newBlog = req.body;
      const result = await blogs_collection.insertOne(newBlog);
      console.log(req.body);
      res.send(result);
    });

    //delivery item & stock decrease 
    app.put('/products/:id', async (req, res) => {
      // console.log('update a product');
      const productId = req.params;
      console.log(productId);
      const itemStock = req.body.itemInStock;
      const query = { _id: ObjectId(productId) };
      // const options = { upsert: true };
      const updateDoc = {
        $set: {
          itemInStock: itemStock
        }
      };
      const result = await products_collection.updateOne(query, updateDoc);
      res.send(result)
      console.log(itemStock);
    });

    //update product and stock
    app.put('/updateproduct/:id', async (req, res) => {
      const productId = req.params;
      console.log(productId);
      const itemStock = req.body.itemInStock;
      const query = { _id: ObjectId(productId) };
      const updateDoc = {
        $set: {
          itemInStock: req.body.itemInStock, itemName: req.body.itemName, itemPrice: req.body.itemPrice

        }
      };
      const result = await products_collection.updateOne(query, updateDoc);
      res.send(result)
      console.log(req.body);
    })

    //delete an item
    app.delete('/products', async (req, res) => {
      console.log('deleting in progress');
      console.log(req.body);
      const productId = req.body.productId;
      const query = { _id: ObjectId(productId) };
      const result = await products_collection.deleteOne(query);
      res.send(result)
    })




  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})