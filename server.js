const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const app = express();

app.use(cookieParser());

app.use(express.static(__dirname + "/public"));

const session = require("express-session");

app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

mongoose
  .connect(
    "mongodb+srv://121priyank2120:priyank%402120@cluster24.jlg0luw.mongodb.net/organ-donation-aakash"
  )
  .then(console.log("db connected"));

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("/public"));

const userSchema = {
  name: String,
  email: String,
  password: String,
  type: String,
  address: String,
  age: String,
  no: String,
  blood: String,
  gender: String,
  organ: String,
};

const User = mongoose.model("User", userSchema);

const donarSchema = {
  name: String,
  email: String,
  type: String,
  address: String,
  age: String,
  no: String,
  blood: String,
  gender: String,
  organ: String,
  notification: [],
};

const Doanr = mongoose.model("Donar", donarSchema);

const receiverSchema = {
  name: String,
  email: String,
  address: String,
  age: String,
  no: String,
  blood: String,
  gender: String,
  organ: String,
  notification: [],
};

const Receiver = mongoose.model("Receiver", receiverSchema);

app.get("/login", (req, res) => {
  res.render("pages/login");
});

app.get("/testimonial", (req, res) => {
  res.render("pages/testimonial");
});

app.get("/treatment", (req, res) => {
  res.render("pages/treatment");
});
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

app.get("/about", (req, res) => {
  res.render("pages/about");
});

app.get("/doctor", (req, res) => {
  res.render("pages/doctorprofile");
});

app.get("/contact", (req, res) => {
  res.render("pages/contact");
});

app.get("/", async (req, res) => {
  var num = 0;
  const useremail = req.cookies.useremail;
  if (useremail) {
    const user = await User.find({ email: useremail });
    if (user) {
      if (user[0].type == "Donor") {
        num = 1;
      } else if (user[0].type == "Receiver") {
        num = 2;
      } else if (user[0].type == "Hospital") {
        num = 3;
      }
      const maxAgeInMilliseconds = 5 * 24 * 60 * 60 * 1000;
      res.cookie("useremail", user[0].email, {
        maxAge: maxAgeInMilliseconds,
        httpOnly: true,
      });
      console.log(num, user[0].type, "this is num");
      res.render("pages/index.ejs", { cmm: num });
    } else {
      res.render("pages/index.ejs", { cmm: num });
    }
  } else {
    res.render("pages/index.ejs", { cmm: num });
  }
});

app.post("/create-account", (req, res) => {
  const user = new User({
    name: req.body.uname,
    email: req.body.email,
    password: req.body.pass,
    type: req.body.userdetails,
  });
  user.save();
  res.render("pages/login");
});

app.post("/login", async (req, res) => {
  const { email, uname } = req.body;

  const user = await User.find({ email: email });
  var num = 0;
  const maxAgeInMilliseconds = 5 * 24 * 60 * 60 * 1000;
  if (user) {
    console.log(user);
    if (user[0].type == "Donor") {
      num = 1;
      res.cookie("usertype", num, {
        maxAge: maxAgeInMilliseconds,
        httpOnly: true,
      });
    } else if (user[0].type == "Receiver") {
      num = 2;
      res.cookie("usertype", num, {
        maxAge: maxAgeInMilliseconds,
        httpOnly: true,
      });
    } else if (user[0].type == "Hospital") {
      num = 3;
      res.cookie("usertype", num, {
        maxAge: maxAgeInMilliseconds,
        httpOnly: true,
      });
    }

    res.cookie("useremail", user[0].email, {
      maxAge: maxAgeInMilliseconds,
      httpOnly: true,
    });
    console.log(num, user[0].type, "this is num");
    res.render("pages/index.ejs", { cmm: num });
  } else {
    res.render("pages/login");
  }

  // const user = new User({
  //   name: req.body.uname,
  //   email: req.body.email,
  //   password: req.body.pass,
  //   type: req.body.userdetails
  // });
  // user.save();
  // res.render("pages/login");
});

app.post("/donarprofile", async (req, res) => {
  const { Name, Add, Age, No, Blood, Gen, Organ } = req.body;
  const user = await User.find({ email: req.cookies.useremail });
  if (user) {
    var currentUser = user[0];
    if (Name) currentUser.name = Name;
    if (Age) currentUser.age = Age;
    if (Add) currentUser.address = Add;
    if (No) currentUser.no = No;
    if (Blood) currentUser.blood = Blood;
    if (Gen) currentUser.gender = Gen;
    if (Organ) currentUser.organ = Organ;

    currentUser.save();
    currentUser = await User.find({ email: req.cookies.useremail });

    const exixting = await Doanr.find({ email: currentUser[0].email });
    if (exixting.length > 0) {
      (exixting[0].name = currentUser[0].name),
        (exixting[0].email = currentUser[0].email),
        (exixting[0].type = currentUser[0].type),
        (exixting[0].address = currentUser[0].address),
        (exixting[0].age = currentUser[0].age),
        (exixting[0].no = currentUser[0].no),
        (exixting[0].blood = currentUser[0].blood),
        (exixting[0].gender = currentUser[0].gender),
        (exixting[0].organ = currentUser[0].organ),
        exixting[0].save();
    } else {
      var donar = await new Doanr({
        name: currentUser[0].name,
        email: currentUser[0].email,
        type: currentUser[0].type,
        address: currentUser[0].address,
        age: currentUser[0].age,
        no: currentUser[0].no,
        blood: currentUser[0].blood,
        gender: currentUser[0].gender,
        organ: currentUser[0].organ,
      });

      await donar.save();
    }
    const allreceiver = await Receiver.find();
    console.log("this is all reciver", allreceiver);
    for (var i = 0; i < allreceiver.length; i++) {
      if (currentUser[0].organ) {
        await allreceiver[i].notification.push(
          currentUser[0].name +
            " " +
            "is donation an organ" +
            " " +
            currentUser[0].organ
        );
        await allreceiver[i].save();
      }
    }

    res.render("pages/profile", {
      User: currentUser[0].name,
      Name: currentUser[0].name,
      Add: currentUser[0].address,
      Age: currentUser[0].age,
      No: currentUser[0].no,
      Blood: currentUser[0].blood,
      Gen: currentUser[0].gender,
      cmm: Number(req.cookies.usertype),
    });
  } else {
    res.render("pages/login");
  }
});

app.post("/receiverprofile", async (req, res) => {
  const { Name, Add, Age, No, Blood, Gen, Organ } = req.body;
  const user = await User.find({ email: req.cookies.useremail });
  if (user) {
    var currentUser = user[0];
    if (Name) currentUser.name = Name;
    if (Age) currentUser.age = Age;
    if (Add) currentUser.address = Add;
    if (No) currentUser.no = No;
    if (Blood) currentUser.blood = Blood;
    if (Gen) currentUser.gender = Gen;
    if (Organ) currentUser.organ = Organ;

    currentUser.save();

    currentUser = await User.find({ email: req.cookies.useremail });
    const exixting = await Receiver.find({ email: currentUser[0].email });
    console.log(exixting, "this is existiong");
    if (exixting.length > 0) {
      exixting[0].name = currentUser[0].name;
      exixting[0].email = currentUser[0].email;
      exixting[0].address = currentUser[0].address;
      exixting[0].age = currentUser[0].age;
      exixting[0].no = currentUser[0].no;
      exixting[0].blood = currentUser[0].blood;
      exixting[0].gender = currentUser[0].gender;
      exixting[0].organ = currentUser[0].organ;

      exixting[0].save();
    } else {
      var receiver = new Receiver({
        name: currentUser[0].name,
        email: currentUser[0].email,
        address: currentUser[0].address,
        age: currentUser[0].age,
        no: currentUser[0].no,
        blood: currentUser[0].blood,
        gender: currentUser[0].gender,
        organ: currentUser[0].organ,
      });

      await receiver.save();
    }

    res.render("pages/profile", {
      User: currentUser[0].name,
      Name: currentUser[0].name,
      Add: currentUser[0].address,
      Age: currentUser[0].age,
      No: currentUser[0].no,
      Blood: currentUser[0].blood,
      Gen: currentUser[0].gender,
      cmm: Number(req.cookies.usertype),
    });
  } else {
    res.render("pages/login");
  }
});

app.get("/notification", async (req, res) => {
  const email = req.cookies.useremail;
  console.log(email);
  if (email) {
    const user = await Receiver.findOne({ email: email });
    if (user) {
      console.log(user.notification);
      res.render("pages/notification", { notification: user.notification });
    } else {
      res.render("pages/notification", { notification: [] });
    }
  } else {
    res.render("pages/notification", { notification: [] });
  }
});
app.get("/profile", async (req, res) => {
  const user = await User.find({ email: req.cookies.useremail });
  const userType = req.cookies.usertype;
  if (userType == 3) {
    const receiver = await Receiver.find();
    const donar = await Doanr.find();
    if (receiver) {
      res.render("pages/profile", {
        cmm: Number(req.cookies.usertype),
        receiver: receiver,
        donar: donar, 
      });
    }
  } else if (user) {
    console.log(user);
    res.render("pages/profile", {
      User: user[0].name,
      Name: user[0].name,
      Add: user[0].address,
      Age: user[0].age,
      No: user[0].no,
      Blood: user[0].blood,
      Gen: user[0].gender,
      cmm: Number(req.cookies.usertype),
    });
  } else {
    res.render("pages/login");
  }
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
