require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const md5 = require("md5");

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
    const newUser = new User({
        email: req.body.username,
        password: md5(req.body.password)
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

app.post("/login", async (req, res) => {
    const username = req.body.username;
    const password = md5(req.body.password);

    await User.findOne({email: username})
    .then(foundUser => {
        if(foundUser) {
            if (foundUser.password === password) {
                res.render("secrets");
                console.log(foundUser.password);
            } else {
                console.log("Incorrect password.");
                res.redirect("/");
            }
        } else {
            console.log("Username not found.");
            res.redirect("/");
        }
    })
    .catch(err => {
        console.log(err);
        res.redirect("/");
    });

});


app.listen(3000, () => {
    console.log("Server started on port 3000.")
});