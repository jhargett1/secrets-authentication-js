require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');

const saltRounds = 10;

const secret = process.env.SECRET;

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

mongoose.connect(process.env.MONGO_CONNECTION);

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

const User = mongoose.model("User", userSchema);

app.get("/", async (req, res) => {
    res.render("home");
});

app.get("/login", async (req, res) => {
    res.render("login");
});

app.get("/register", async (req, res) => {
    res.render("register");
});

app.post("/register", async  (req, res) => {

    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        const newUser = new User({
            email: req.body.username,
            password: hash
        });
        newUser.save()
        .then(createdUser => {
            if(createdUser) {
                res.render("secrets");
            } else {
                console.log("Something wrong happened.");
                res.redirect("/");
            }
        
        })
        .catch(err => {
            console.log(err);
            res.redirect("/");
        });
    });

    
});

app.post("/login", async (req, res) => { 
    const username = req.body.username;
    const password = req.body.password;
  
    try {
      const user = await User.findOne({email: username});
  
      if (user) {
        const result = bcrypt.compare(password, user.password);
        
        if (result) {
          res.render("secrets");
        } 
      }
  
    } catch (err) {
      console.log(err);
    }
  });

app.listen(3000, () => {
    console.log("Server started on port 3000.")
});