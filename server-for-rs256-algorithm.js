/** @format */

// this service is using RS256 hash algorithm

const express = require("express");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const bodyParser = require("body-parser");
const cors = require("cors");

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

// Load the private key from a file
const privateKey = fs.readFileSync("private.key", "utf8");

// Load the public key from a file
const publicKey = fs.readFileSync("public.crt", "utf8");

// RS256 signup
app.post("/signup", (req, res) => {
  // Extract the username and password from the request body
  const { username, password, email } = req.body;

  if (!username || !password || !email) {
    res.status(400).send({ message: "Please fill all required fields!" });
  }
  const user = new User({
    username,
    password,
    email,
  });

  user
    .save()
    .then(() => {
      // Sign a JWT with the user's ID as the subject and the private key

      const oldDate = new Date().getMilliseconds();
      const token = jwt.sign({ sub: user.id }, privateKey, {
        algorithm: "RS256",
      });
      let newDate;
      setTimeout(() => {
        newDate = new Date().getMilliseconds();
        console.log(newDate - oldDate + "ms for creating token using RS256 algorithm");
      }, 87);

      res.status(200).send({ token }); //token
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// RS256 login
app.post("/login", (req, res) => {
  // Extract the username and password from the request body
  const { password, token, email } = req.body;

  User.findOne({ email })
    .then((user) => {
      // Sign a JWT with the user's ID as the subject and the private key

      if (user.password !== password)
        res.status(400).send({ error: "password is not correct!" });
      jwt.verify(token, publicKey, (error, decoded) => {
        if (error) {
          return res.status(401).send({ error: "Invalid token" });
        }
        res.status(200).send({ message: "Success" });
      });
    })
    .catch((err) => {
      res.send(err);
    });
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
