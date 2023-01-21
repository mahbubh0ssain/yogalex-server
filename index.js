require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Chosha Ghor server is runing successfully");
});

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@choshmaghor.zsozb10.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const dbConnect = async () => {
  try {
    await client.connect();
    console.log("DB connected successfully.");
  } catch (err) {
    console.error(err);
  }
};
dbConnect();

//generate jwt and send token
app.post("/jwt/:email", (req, res) => {
  const email = req.params.email;
  const result = jwt.sign(email, process.env.Token_Code);
  res.send(result);
});

// users collection
const UsersCollection = client.db("ChoshmaGhor").collection("usersCollection");

// save user ino
app.put("/user/:email", async (req, res) => {
  const email = req.params.email;
  const result = await UsersCollection.updateOne(
    { email: email },
    { $set: req.body },
    { upsert: true }
  );
  res.send({ result });
});

//get admin role
app.get("/get-role/:email", async (req, res) => {
  const email = req.params.email;
  const result = await UsersCollection.findOne({ email });
  res.send(result);
});

// get all users by admin
app.get("/get-users/:email", async (req, res) => {
  const email = req.params.email;
  const isAdmin = await UsersCollection.findOne({ email });
  if (isAdmin && isAdmin?.role === "admin") {
    const users = await UsersCollection.find({}).toArray();
    const result = users.filter((user) => user?.role !== "admin");
    res.send(result);
  } else {
    return res.send("Unauthorized user request");
  }
});

// delete book info by id
app.delete("/deleteUser", async (req, res) => {
  try {
    const id = req.query.id;

    const result = await UsersCollection.deleteOne({ _id: ObjectId(id) });

    res.send(result);
  } catch (err) {
    console.error(err);
  }
});

// bookingCollection
const BookingCollection = client
  .db("ChoshmaGhor")
  .collection("bookingCollection");

//get all booking options
app.get("/bookings", async (req, res) => {
  try {
    const result = await BookingCollection.find().toArray();
    res.send({
      status: true,
      data: result,
    });
  } catch (err) {
    console.error(err);
  }
});

const BookedCollection = client
  .db("ChoshmaGhor")
  .collection("BookedCollection");

// post booked info
app.post("/booked", async (req, res) => {
  try {
    const bookingInfo = req.body;
    const result = await BookedCollection.insertOne(bookingInfo);
    res.send({
      status: true,
      data: result,
    });
  } catch (err) {
    console.log(err);
  }
});

// get book info by email
app.get("/bookedInfo", async (req, res) => {
  try {
    const email = req.query.email;
    const result = await BookedCollection.find({ email: email }).toArray();
    res.send(result);
  } catch (err) {
    console.error(err);
  }
});

// delete book info by id
app.delete("/deleteBooking", async (req, res) => {
  try {
    const id = req.query.id;
    const result = await BookedCollection.deleteOne({ _id: ObjectId(id) });
    res.send(result);
  } catch (err) {
    console.error(err);
  }
});

// all trainers collection
const TrainersCollection = client
  .db("ChoshmaGhor")
  .collection("trainersCollection");

// get all trainers
app.get("/trainer", async (req, res) => {
  const result = await TrainersCollection.find().toArray();
  res.send(result);
});

// delete trainer by id
app.delete("/deleteTrainer", async (req, res) => {
  try {
    const id = req.query.id;
    const result = await TrainersCollection.deleteOne({ _id: ObjectId(id) });
    res.send(result);
  } catch (err) {
    console.error(err);
  }
});

// post trainer collection
app.post("/trainer", async (req, res) => {
  const data = req.body;
  const result = await TrainersCollection.insertOne(data);
  res.send(result);
});

// listening the server
app.listen(port, () => {
  console.log("Choshma Ghor server is runing successfully on", port);
});
