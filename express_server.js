const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const cookieSession = require("cookie-session");
const { doesEmailExist, generateRandomString, authenticateUser, urlsForUser, filteredDB, isLoggedIn } = require('./helpers/helpers');

const app = express();
const PORT = 8080; // default port 8080




//allows express to read ejs files
app.set("view engine", "ejs");

//Parses Cookie header and populate req.session with an object keyed by the cookie names
app.use(
  cookieSession({
    name: "session",
    keys: [
      "8f232fc4-47de-41a1-a8cd-4f9323253715",
      "1279e050-24c2-4cc6-a176-3d03d66948a2"],
  })
);

// Parses incoming request bodies in a middleware before your handlers, available under the req.body property
app.use(bodyParser.urlencoded({ extended: true }));

const emptyObj = { urls: {}, user: null };


/* ------------------- SAMPLE DATABASES ----------------------------------------- */

//Database with url data
const urlDatabase = {
  userRandomID: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
  user2RandomID: { longURL: "https://www.google.ca", userID: "user2RandomID" },
};

//Database with user data
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
/* ------------------- END OF SAMPLE DATABASES ------------------------------------ */

//returns the urls database in JSON format. Doesn't really serve any purpose but good to have when you want to do some testing
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


//ROOT PAGE
app.get("/", (req, res) => {
  res.send("Hello!");
});


//MAIN PAGE - displays list of urls
app.get("/urls", (req, res) => {

  //checks if a user is logged in by checking if there is a cookie
  //if no user is logged in then it returns a blank main urls page
  if (!req.session.user_id) {
    return res.render("urls_index", emptyObj);
  }

  //otherwise it filters the database to only those urls belonging to the user
  const usersDatabase = filteredDB(urlDatabase, req.session.user_id.id);
  const templateVars = { 
    urls: usersDatabase,
    user: req.session.user_id 
  };
  return res.render("urls_index", templateVars);
});


//REGISTRATION
app.get("/register", (req, res) => {
  const templateVars = { urls: {}, user: null };
  res.render("urls_registration", templateVars);
});
app.post("/register", (req, res) => {
  if (!req.body.email) {
    return res.status(400).send("Email is invalid!");
  } else if (!req.body.password) {
    return res.status(400).send("Password is invalid!");
  } else if (doesEmailExist(req.body.email, users)) {
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
  users[id] = { id: id, email: email, password: hashedPassword };

  req.session.user_id = users[id];
  res.redirect("/urls");
});


//LOGIN
app.get("/login", (req, res) => {
  res.render("urls_login", emptyObj);
});
app.post("/login", (req, res) => {
  const result = authenticateUser(req.body.email, req.body.password, users);

  if (result) {
    req.session.user_id = result;
    return res.redirect("/urls");
  }

  return res.status(403).send("Invalid email or password");
});


//Create new URL
app.get("/urls/new", (req, res) => {
  const templateVars = { user: req.session.user_id };
  if (!req.session.user_id) {
    return res.render("urls_login", emptyObj);
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
    userID: req.session.user_id.id,
  };
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
      const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: req.session.user_id };
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

  const newDB = filteredDB(urlDatabase, req.session.user_id.id);
  if (urlsForUser(newDB, req)) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  }
  return res.status(401).send("Unauthorized");
});


//EDITS URL
app.post("/urls/:shortURL", (req, res) => {
  if (!isLoggedIn(req)) return res.status(401).send("Unauthorized");

  const newDB = filteredDB(urlDatabase, req.session.user_id.id);
  if (urlsForUser(newDB, req)) {
    const { shortURL } = req.params;
    urlDatabase[shortURL].longURL = req.body.updatedURL;
    res.redirect("/urls");
  }
  return res.status(401).send("Unauthorized");
});


//LOGOUT
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
