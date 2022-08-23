const express = require('express')
const app = express()
var cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = 5000

//db user name and pass
//un: shafin
//upass: D9rLmZHnXxYNKbK3


//middleware 
app.use(cors())
app.use(express.json())


const uri = "mongodb+srv://shafin:D9rLmZHnXxYNKbK3@bit-n-byte.qvrh1qr.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
  try {
    const database = client.db('bit-n-byte');
    const products_collection = database.collection('products');
    const blogs_collection = database.collection('blogs');
   
    // show all products of inventory
    app.get('/products' , async(req, res)=>{
      console.log('getting all products');
      const cursor =products_collection.find({});
      const result =  await cursor.toArray();
      res.send(result);
    })
    // show all blogs
    app.get('/blogs' , async(req, res)=>{
      // console.log('getting all blogs');
      const cursor =blogs_collection.find({});
      const result =  await cursor.toArray();
      res.send(result);
    })

    //find a product
    app.get('/products/:productID', async(req, res)=>{
      // console.log('getting one product');
      const productId = req.params.productID;
      const query = {_id: ObjectId(productId)}
      const searchedItem = await products_collection.findOne(query);
      // console.log(searchedItem);
      res.send(searchedItem);
    })

    //find my products
    app.get('/vendorsproduct', async(req, res)=>{
      const vendor = req.query.vendorname;
      const query = {vendorName: vendor};
      const cursor = products_collection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })

    // find stock out items 
    app.get('/stockoutitems', async(req, res)=>{
      // const vendor = req.query.vendorname;
      const query = {itemInStock: 0};
      const cursor = products_collection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })

    //add new product
    app.post('/products' , async(req, res)=>{
      // console.log('hitting the products');
      const newProduct = req.body;
      const result= await products_collection.insertOne(newProduct);
      console.log(req.body);
      res.send(result);
    });
    //add new blog
    app.post('/blogs' , async(req, res)=>{
      // console.log('hitting the blogs');
      const newBlog = req.body;
      const result= await blogs_collection.insertOne(newBlog);
      console.log(req.body);
      res.send(result);
    });

    //delivery item & stock decrease 
    app.put('/products/:id', async(req, res)=>{
      // console.log('update a product');
      const productId = req.params;
      console.log(productId);
      const itemStock = req.body.itemInStock;
      const query = {_id: ObjectId(productId)};
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
    app.put('/updateproduct/:id', async(req, res)=>{
      const productId = req.params;
      console.log(productId);
      const itemStock = req.body.itemInStock;
      const query = {_id: ObjectId(productId)};
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
    app.delete('/products', async(req, res)=>{
      console.log('deleting in progress');
      console.log(req.body);
      const productId = req.body.productId;
      const query = {_id: ObjectId(productId)};
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