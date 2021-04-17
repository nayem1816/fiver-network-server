const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const ObjectID = require("mongodb").ObjectID;
require("dotenv").config();
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());
const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cfpno.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect((err) => {
  const ServiceCollection = client.db("fiverNetwork").collection("services");

  app.get("/services", (req, res) => {
    ServiceCollection.find().toArray((err, items) => {
      res.send(items);
      // console.log('Db Items', items);
    });
  });

  app.get("/service/:id", (req, res) => {
    const id = ObjectID(req.params.id);
    ServiceCollection.find({ _id: id }).toArray((err, documents) => {
      res.send(documents[0]);
    });
  });

  app.post("/addService", (req, res) => {
    const addNewService = req.body;
    console.log("new Service", addNewService);
    ServiceCollection.insertOne(addNewService).then((result) => {
      console.log("Inserted Count", result.insertedCount);
      res.send(result.insertedCount > 0);
    });
  });

  app.delete("/delete/:id", (req, res) => {
    const id = ObjectID(req.params.id);
    ServiceCollection.deleteOne({ _id: id }).then((result) => {
      console.log(result.deletedCount > 0);
    });
  });
});
client.connect((err) => {
  const orderServiceCollection = client
    .db("fiverNetwork")
    .collection("OrderServices");

  app.post("/addBooking", (req, res) => {
    const newOrderService = req.body;
    orderServiceCollection.insertOne(newOrderService).then((result) => {
      res.send(result.insertedCount > 0);
    });
    console.log(newOrderService);
  });

  app.patch("/update/:id", (req, res) => {
    const id = ObjectID(req.params.id);
    console.log(req.body.updateStatus.status);
    orderServiceCollection
      .updateOne(
        { _id: id },
        {
          $set: { status: req.body.updateStatus.status },
        }
      )
      .then((result) => {
        // console.log(result);
      });
  });

  app.get("/bookingsEmail", (req, res) => {
    orderServiceCollection
      .find({ email: req.query.email })
      .toArray((err, documents) => {
        res.send(documents);
      });
  });

  app.get("/bookings", (req, res) => {
    orderServiceCollection.find().toArray((err, documents) => {
      res.send(documents);
    });
  });
});
client.connect((err) => {
  const reviewCollection = client.db("fiverNetwork").collection("review");

  app.get("/review", (req, res) => {
    reviewCollection.find().toArray((err, items) => {
      res.send(items);
      // console.log('Db Items', items);
    });
  });

  app.post("/reviews", (req, res) => {
    const newReview = req.body;
    reviewCollection.insertOne(newReview).then((result) => {
      res.send(result.insertedCount > 0);
    });
    console.log(newReview);
  });
});
client.connect((err) => {
  const adminEmailCollection = client
    .db("fiverNetwork")
    .collection("adminEmail");

  app.get("/isAdmin", (req, res) => {
    adminEmailCollection.find({ email: req.query.email }).toArray((err, admin) => {
      res.send(admin);
    });
  });

  app.post("/adminEmail", (req, res) => {
    const newEmail = req.body;
    adminEmailCollection.insertOne(newEmail).then((result) => {
      res.send(result.insertedCount > 0);
    });
    console.log(newEmail);
  });
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
