const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

//Parse Cookie header and populate req.cookies with an object keyed by the cookie names
const cookieParser = require("cookie-parser");
app.use(cookieParser());

//Parse incoming request bodies in a middleware before your handlers, available under the req.body property
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

const bcrypt = require("bcrypt");

//Generates a random 6 character string to use as user's id
function generateRandomString() {
  let result = "";
  let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

//Checks if the email already exists in users database and returns the 
//user's info if it does
let doesEmailExist = function (email) {
  for (let user in users) {
    if (users[user].email === email) return users[user];
  }
  return false;
};

//Authenticates user. If everything is valid then returns user's info
const authenticateUser = (email, password) => {
  const result = doesEmailExist(email);

  if(result && bcrypt.compareSync(password, result.password)) {
    return result;
  }
  return false;
};

//Checks if the url is in the database. Input the filtered database which includes
//only those urls that belong to the client. The req variable is passed along when
//the user hits EDIT in the /urls page. It includes the url id in question which is
//passed into the following function
const urlsForUser = function (db, req) {
  for (let id in db) {
    if (req.params.shortURL === id) {
      return true;
    }
  }
  return false;
};

const urlDatabase = {
  userRandomID: { longURL: "https://www.tsn.ca", userID: "userRandomID" },

  user2RandomID: { longURL: "https://www.google.ca", userID: "user2RandomID" },
};

//FILTERS URL DATABASE BY USERID
const filteredDB = function (db, userID) {
  let newDB = {};
  for (let id in db) {
    if (db[id].userID === userID) {
      newDB[id] = db[id];
    }
  }
  return newDB;
};

//STORES USER DATA
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "$2b$10$Dv2gtMi8SWMjzmI.SpN00ul646Kc8DxiiPjDO8PEfNERpY9Hw/Zd6",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "$2b$10$Dv2gtMi8SWMjzmI.SpN00ul646Kc8DxiiPjDO8PEfNERpY9Hw/Zd6",
  },
};

//ROOT PAGE
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//MAIN PAGE - LIST OF URLS
app.get("/urls", (req, res) => {
  if (!req.cookies.user_id) {
    return res.render("urls_index", { urls: {}, user: null });
  }
  const templateVars = { urls: filteredDB(urlDatabase, req.cookies.user_id.id), user: req.cookies.user_id };
  console.log(templateVars.urls);
  return res.render("urls_index", templateVars);
});

//REGISTRATION
app.get("/register", (req, res) => {
  res.render("urls_registration");
});
app.post("/register", (req, res) => {
  if (!req.body.email) {
    return res.status(400).send("Email is invalid!");
  } else if (!req.body.password) {
    return res.status(400).send("Password is invalid!");
  } else if (doesEmailExist(req.body.email)) {
    return res.status(400).send("A user with that email already exists");
  }

  //Putting user info into the 'users' database
  //db format = rtbEHW: { id: 'rtbEHW', email: 'moses.kim@live.ca', password: 'asdf' }
  //cookie format = { id: 'rtbEHW', email: 'moses.kim@live.ca', password: 'asdf' }
  const id = generateRandomString();
  const password = req.body.password;

  //10 is the number of rounds to use when generating a salt.
  //Salting hashes refers to adding random data to the input of a hash function to guarantee
  //a unique output, the hash, even when the inputs are the same.
  const hashedPassword = bcrypt.hashSync(password, 10);
  const email = req.body.email;
  users[id];
  users[id] = { id: id,
    email: email,
    password: hashedPassword };

  res.cookie("user_id", users[id]);
  res.redirect("/urls");
});

//LOGIN
app.get("/login", (req, res) => {
  res.render("urls_login");
});
app.post("/login", (req, res) => {
  const result = authenticateUser(req.body.email, req.body.password);

  if (result) {
    res.cookie("user_id", result);
    return res.redirect("/urls");
  }

  return res.status(403).send("Invalid email or password");
});

//Checks if a user is logged in
const isLoggedIn = function (req) {
  if (req.cookies.user_id) {
    return { loggedIn: true, userData: req.cookies.user_id };
  }
  return false;
};

//Create new URL
app.get("/urls/new", (req, res) => {
  const templateVars = { user: req.cookies.user_id };
  if (!req.cookies.user_id) {
    return res.render("urls_login");
  }
  return res.render("urls_new", templateVars);
});

//When user hits 'create new URL' it will redirect them to the urls/shortURL page
//Once they submit the new url it will take them to the main page
app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const short = generateRandomString();
  urlDatabase[short] = {
    longURL: req.body.longURL,
    userID: req.cookies.user_id.id
  };
  console.log(urlDatabase);
  res.redirect(`/urls`); // Respond with 'Ok' (we will replace this)
});

//Takes you to the long URL page
app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//You can update the url in this page
app.get("/urls/:shortURL", (req, res) => {
  const result = isLoggedIn(req);

  if (result) {
    const newDB = filteredDB(urlDatabase, result.userData.id);

    if (urlsForUser(newDB, req)) {
      const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: req.cookies.user_id };
      return res.render("urls_show", templateVars);
    }
    return res.send("This URL does not belong to you");
  }
  return res.send("Please log in to continue");
});

//DELETES URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const { shortURL } = req.params;
  if (!isLoggedIn(req)) return res.status(401).send("Unauthorized");

  const newDB = filteredDB(urlDatabase, req.cookies.user_id.id);
  if (urlsForUser(newDB, req)) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  }
  return res.status(401).send("Unauthorized");
});

//EDITS URL
app.post("/urls/:shortURL", (req, res) => {
  if (!isLoggedIn(req)) return res.status(401).send("Unauthorized");

  const newDB = filteredDB(urlDatabase, req.cookies.user_id.id);
  if (urlsForUser(newDB, req)) {
    const { shortURL } = req.params;
    urlDatabase[shortURL].longURL = req.body.updatedURL;
    res.redirect("/urls");
  }
  return res.status(401).send("Unauthorized");
});

//LOGOUT
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
