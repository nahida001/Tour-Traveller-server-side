const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();

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

const db = client.db("Travel_Tour");
const TourPakegeCollection = db.collection("package");
const pakageBookCollection = db.collection("booking");

// Root API
app.get("/", (req, res) => {
  res.send("Travel Tour fresh mind");
});


// ================= PACKAGE API =================

// Get packages
app.get("/package", async (req, res) => {
  try {
    const email = req.query.email;

    const query = {};

    if (email) {
      query.hrEmail = email;
    }

    const result = await TourPakegeCollection
      .find(query)
      .toArray();

    res.send(result);

  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Failed to get packages"
    });
  }
});


// Add package
app.post("/package", async (req, res) => {
  try {
    const newPackage = req.body;

    const result =
      await TourPakegeCollection.insertOne(newPackage);

    res.send(result);

  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Failed to add package"
    });
  }
});


// Get single package
app.get("/package/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const query = {
      _id: new ObjectId(id)
    };

    const result =
      await TourPakegeCollection.findOne(query);

    res.send(result);

  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Failed to get package"
    });
  }
});


// Get packages with booking count
app.get("/package/booking", async (req, res) => {
  try {
    const email = req.query.email;

    const query = {
      hrEmail: email
    };

    const packages =
      await TourPakegeCollection.find(query).toArray();

    for (const pakag of packages) {

      const bookingQuery = {
        pakageId: pakag._id.toString()
      };

      const booking_count =
        await pakageBookCollection.countDocuments(
          bookingQuery
        );

      pakag.booking_count = booking_count;
    }

    res.send(packages);

  } catch (error) {
    console.error(error);

    res.status(500).send({
      message: "Failed to get booking count"
    });
  }
});


// ================= BOOKING API =================

// Create booking
app.post("/booking", async (req, res) => {
  try {

    const booked = req.body;

    const result =
      await pakageBookCollection.insertOne(booked);

    res.send(result);

  } catch (error) {

    console.error(error);

    res.status(500).send({
      message: "Failed to create booking"
    });
  }
});


// Get booking by applicant email
app.get("/booking", async (req, res) => {
  try {

    const email = req.query.email;

    const query = {
      applicant: email
    };

    const result =
      await pakageBookCollection
        .find(query)
        .toArray();

    for (const booking of result) {

      const pakageId = booking.pakageId;

      const pakageQuery = {
        _id: new ObjectId(pakageId)
      };

      const pakage =
        await TourPakegeCollection.findOne(
          pakageQuery
        );

      if (pakage) {

        booking.tourName = pakage.tourName;
        booking.duration = pakage.duration;
        booking.departureDate = pakage.departureDate;
        booking.price = pakage.price;

      }
    }

    res.send(result);

  } catch (error) {

    console.error(error);

    res.status(500).send({
      message: "Failed to get bookings"
    });
  }
});


// Update booking status
app.patch("/booking/:id", async (req, res) => {
  try {

    const id = req.params.id;

    const filter = {
      _id: new ObjectId(id)
    };

    const updatedDoc = {
      $set: {
        status: req.body.status
      }
    };

    const result =
      await pakageBookCollection.updateOne(
        filter,
        updatedDoc
      );

    res.send(result);

  } catch (error) {

    console.error(error);

    res.status(500).send({
      message: "Failed to update booking"
    });
  }
});


// Get booking by package ID
app.get("/booking/package/:pakage_id", async (req, res) => {
  try {

    const pakage_id = req.params.pakage_id;

    const query = {
      pakageId: pakage_id
    };

    const result =
      await pakageBookCollection
        .find(query)
        .toArray();

    res.send(result);

  } catch (error) {

    console.error(error);

    res.status(500).send({
      message: "Failed to get package bookings"
    });
  }
});


// MongoDB connection
async function connectDB() {
  try {

    await client.connect();

    await client
      .db("admin")
      .command({ ping: 1 });

    console.log(
      "Pinged your deployment. Successfully connected to MongoDB!"
    );

  } catch (error) {

    console.error("MongoDB connection error:", error);

  }
}

connectDB();


// Important for Vercel
module.exports = app;