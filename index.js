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
   

    app.get('/products' , async(req, res)=>{
      console.log('getting all products');
      const cursor =products_collection.find({});
      const result =  await cursor.toArray();
      res.send(result);
    })
    //find a product
    app.get('/products/:productID', async(req, res)=>{
      console.log('getting one product');
      const productId = req.params.productID;
      const query = {_id: ObjectId(productId)}
      const searchedItem = await products_collection.findOne(query);
      // console.log(searchedItem);
      res.send(searchedItem);
    })
    app.post('/products' , async(req, res)=>{
      console.log('hitting the products');
      const newProduct = req.body;
      const result= await products_collection.insertOne(newProduct);
      console.log(req.body);
      res.send(result);
    });
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