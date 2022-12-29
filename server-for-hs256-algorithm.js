/** @format */

// this service is using HS256 hash algorithm

const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cors = require("cors");

const randomString = require("random-string");
const app = express();
app.use(cors());

const mongoose = require("mongoose");

mongoose.set("strictQuery", true);

mongoose
  .connect(
    "mongodb+srv://mito99:123@cluster0.woocxjm.mongodb.net/users?retryWrites=true&w=majority"
  )
  .then(function () {})
  .catch((err) => console.log("Database connection error", err));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// -----------------JWT-----------------
const Scheme = mongoose.Schema;

const userScheme = new Scheme(
  {
    email: String,
    username: String,
    password: String,
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userScheme);
// -----------------JWT-----------------

const secret = "secret";

app.post("/signup", (req, res) => {
  // Extract the username and password from the request body
  const { username, password, email } = req.body;

  console.log(username, password, email);

  // if (!username || !password || !email) {
  //   res.status(400).send({ message: "Please fill all required fields!" });
  // }

  const user = new User({
    username,
    password,
    email,
  });

  user
    .save()
    .then((result) => {
      const oldDate = new Date().getMilliseconds();
      const token = jwt.sign({ email }, secret);
      const newDate = new Date().getMilliseconds();

      console.log(newDate - oldDate + "ms");
      res.send({ token });
    })
    .catch((err) => {
      res.status(500).send({ message: "Error creating user" });
    });
});

app.post("/login", (req, res) => {
  const { email, password, token } = req.body;

  User.findOne({ email })
    .then((user) => {
      if (!user) {
        return res
          .status(400)
          .send({ error: "Email or password is not correct!" });
      } else if (user.password !== password) {
        return res
          .status(400)
          .send({ error: "Email or password is not correct!" });
      } else {
        jwt.verify(token, secret, (err, decoded) => {
          if (err) {
            res.status(400).send({ error: " token is not correct!" });
          } else {
            res.send({ message: "Success" });
          }
        });
      }
    })
    .catch((err) => {
      res.status(400).send({ error: "Email or password is not correct!" });
    });
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
