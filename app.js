require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.MONGO_CONNECTION);

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", async (req, res) => {
    res.render("home");
});

app.get("/login", async (req, res) => {
    res.render("login");
});

app.get("/register", async (req, res) => {
    res.render("register");
});

app.get("/secrets", async (req, res) => {
    if (req.isAuthenticated()){
        res.render("secrets");
    } else {
        res.redirect("/login");
    }
});

app.post("/register", async (req, res) => {

    try {
  
      const user = await User.register({username: req.body.username}, req.body.password);
      
      passport.authenticate("local")(req, res, () => {
        res.redirect("/secrets");
      });
    } catch (err) {
      console.log(err);
      res.redirect("/register");
    }
  });

  app.post("/login", async (req, res) => { 
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    try {
        const loginPromise = new Promise((resolve, reject) => {
            req.login(user, function(err){
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });

        await loginPromise;

        passport.authenticate("local")(req, res, () => {
            res.redirect("/secrets");
        });
    } catch (err) {
        console.log(err);
    }
});

app.get("/logout", async (req, res) => {
    // Wrap req.logout in a Promise to keep async/await functions consistent 
    const logoutPromise = () => {
        return new Promise((resolve, reject) => {
            req.logout((err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    };

    try {
        await logoutPromise();
        res.redirect("/");
    } catch (err) {
        console.log(err);
    }
});

app.listen(3000, () => {
    console.log("Server started on port 3000.")
});