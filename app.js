const express = require("express");
const mongoose = require("mongoose");
const userModel = require("./models/userSchema");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const middlewares = require("./middleware");

const app = express();
const PORT = process.env.PORT || 5000;
const BASE_URI = `mongodb+srv://javaria:098765@cluster0.eqjyieu.mongodb.net/?retryWrites=true&w=majority`;

mongoose
  .connect(BASE_URI)
  .then((res) => console.log("mongoDb Connect"))
  .catch((err) => console.log(err, "error"));

app.use(express.json());
app.use(cors());


// ========================================SIGNUP===============================================
app.post("/api/signup", async (req, res) => {
  const { firstname, lastname, email, password } = req.body;

  if (!firstname ||!lastname || !email || !password ) {
    res.json({ message: "Requried Fields are missing." });
    return;
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const objToSend = {
    firstname,
    lastname,
    email,
    password: hashPassword,
   
  };

  userModel.findOne({ email }, (err, user) => {
    if (err) {
      console.log(err, "error");
      res.json({
        message: "SomeThing Went Wrong!",
      });
    } else {
      console.log(user, "user");
      if (user) {
        res.json({ message: "email address already use!" });
      } else {
        userModel.create(objToSend, (error, data) => {
          if (error) {
            console.log(error, "error");
            res.json({
              message: "SomeThing Went Wrong!",
            });
          } else {
            res.json({
              message: "user successfully signup!",
              data: data,
              status: true,
            });
          }
        });
      }
    }
  });
});


//=============================================LOGIN===============================================

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.json({ message: "Required fields are missing!" });
    return;
  }

  userModel.findOne({ email }, async (err, user) => {
    if (err) {
      console.log(err, "error");
      res.json({
        message: "SomeThing Went Wrong!",
      });
    } else {
      if (user) {
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        console.log(isPasswordMatch, "isPasswordMatch");
        if (isPasswordMatch) {
          const tokenObj = {
            ...user,
          };
          const token = jwt.sign(tokenObj, "helloworld");
          console.log(token, "token");
          res.json({
            message: "user successfully login",
            data: user,
            status: true,
            token,
          });
        } else {
          res.json({
            message: "credential error!",
          });
        }
      } else {
        res.json({
          message: "credential error!",
        });
      }
    }
  });
});


//-----------------------------------------------------------------------------------------------



//==============================search api=======================================

app.get("/search", (req, res) => {
  const searchTerm = req.query.term;
  db.collection("items").find({ name: { $regex: searchTerm, $options: "i" } }).toArray((err, items) => {
    if (err) {
      console.error(err);
      res.send({ success: false });
      return;
    }
    res.send({ success: true, items });
  });
});


// Product schema
const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String,
  isInCart: { type: Boolean, default: false },
  isFavorite: { type: Boolean, default: false }
});

const Product = mongoose.model('Product', productSchema);

// API routes
app.get('/products', (req, res) => {
  Product.find({}, (err, products) => {
    if (err) return res.status(500).send(err);
    res.send(products);
  });
});

app.post('/products/:id/add-to-cart', (req, res) => {
  Product.findByIdAndUpdate(
    req.params.id,
    { isInCart: true },
    { new: true },
    (err, product) => {
      if (err) return res.status(500).send(err);
      res.send(product);
    }
  );
});

app.post('/products/:id/remove-from-cart', (req, res) => {
  Product.findByIdAndUpdate(
    req.params.id,
    { isInCart: false },
    { new: true },
    (err, product) => {
      if (err) return res.status(500).send(err);
      res.send(product);
    }
  );
});

app.post('/products/:id/add-to-favorite', (req, res) => {
  Product.findByIdAndUpdate(
    req.params.id,
    { isFavorite: true },
    { new: true },
    (err, product) => {
      if (err) return res.status(500).send(err);
      res.send(product);
    }
  );
});

app.post('/products/:id/remove-from-favorite', (req, res) => {
  Product.findByIdAndUpdate(
    req.params.id,
    { isFavorite: false },
    { new: true },
    (err, product) => {
      if (err) return res.status(500).send(err);
      res.send(product);
    }
  );
});



const cardSchema = new mongoose.Schema({
  title: String,
  price: Number,
  description: String,
  imageUrl: String,
  category:  String,
});

const Card = mongoose.model('Card', cardSchema);


app.post('/api/cards', (req, res) => {
  const card = new Card({
    title: req.body.title,
    price: req.body.price,
    description: req.body.description,
    imageUrl: req.body.imageUrl,
    category: req.body.category,
    
  });

  card.save((error) => {
    if (error) {
      res.status(500).send(error);
    } else {
      res.send(card);
    }
  });
});


app.get('/api/cards', (req, res) => {
  Card.find((error, cards) => {
    if (error) {
      res.status(500).send(error);
    } else {
      res.send(cards);
    }
  });
});

app.get('/api/cards/:id', (req, res) => {
  Card.findById(req.params.id, (error, card) => {
    if (error) {
      res.status(500).send(error);
    } else {
      res.send(card);
    }
  });
});


app.get('/api/cards/:category', (req, res) => {
  const category = req.params.category;

  Card.find({ category }, (error, cards) => {
    if (error) {
      res.status(500).send(error);
    } else {
      res.send(cards);
    }
  });
})




app.listen(PORT, () =>
  console.log(`server  running on http://localhost:${PORT}`)
);
