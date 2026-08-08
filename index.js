const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.qxvdmah.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const TourPakegeCollection = client.db("Travel_Tour").collection('package');
    const pakageBookCollection=client.db("Travel_Tour").collection('booking')
    //package Api
    app.get("/package", async (req, res) => {
      const email = req.query.email;
      const query = {};
      if(email){
        query.hrEmail = email;
      }
      const cursor = TourPakegeCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/package", async (req, res) => {
      const newPackage = req.body;
      console.log(newPackage);
      const result = await TourPakegeCollection.insertOne(newPackage);
      res.send(result);
    });
    app.get('/package/:id',async(req,res)=>{
      const id =req.params.id;
      const query={_id:new ObjectId(id)}
      const result=await TourPakegeCollection.findOne(query)
      res.send(result)
    })

    app.get('/pakage/booking',async(req,res)=>{
      const email=req.query.email;
      const query={hrEmail: email};
      const pakages=await TourPakegeCollection.find(query).toArray()
       for(const pakag of pakages){
        const bookingQuery={pakageId :pakage_id.toString()}
        const booking_count=await pakageBookCollection.countDocuments(bookingQuery)
        pakag.booking_count=booking_count
       }
       res.send(pakages)
      
    })

    app.post('/booking',async(req,res)=>{
      const booked=req.body;
      console.log(booked);
      const result=await pakageBookCollection.insertOne(booked);
      res.send(result)
    })
    
    app.get('/booking',async (req,res)=>{
      const email=req.query.email;

      const query={
         applicant: email

      }
      
      const result=await pakageBookCollection.find(query).toArray()

      for(const bookings of result){
         const pakageId=bookings.pakageId
         const pakageQuery={_id: new ObjectId(pakageId)}
         const pakage=await TourPakegeCollection.findOne(pakageQuery)
         bookings.tourName = pakage.tourName;
         bookings.duration =  pakage.duration;
         bookings.departureDate = pakage.departureDate
         bookings.price = pakage.price
      }
     
      res.send(result)
    })
    
    app.patch('/booking/:id',async(req,res)=>{
      const id =req.params.id;
      const filter={_id:new ObjectId(id)}
      const updatedDoc={
        $set:{
          status:req.body.status
        }
      }
      const result=await pakageBookCollection.updateOne(filter,updatedDoc)
      res.send(result)
    })
    app.get('/booking/package/:pakage_id',async(req,res)=>{
     const pakage_id=req.params.pakage_id;
     const query={ pakageId: pakage_id}
     const result=await pakageBookCollection.find(query).toArray()
     res.send(result)
    })
    
    
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Travel Tour fresh mind");
});

app.listen(port, () => {
  console.log(`travel tour server is running on port ${port}`);
});
