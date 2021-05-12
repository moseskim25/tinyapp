const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const cookieParser = require('cookie-parser');
app.use(cookieParser());
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

function generateRandomString() {
  let result = '';
  let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  return result;
}

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

//STORES USER DATA
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

//ROOT PAGE
app.get("/", (req, res) => {
  res.send("Hello!");
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


//LIST OF URLS PAGE
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user_id: req.cookies.user_id };
  res.render("urls_index", templateVars);
});

//REGISTRATION
app.get('/registration', (req,res) => {
  res.render('urls_registration');
})
app.post('/registration', (req,res) => {
  const id = generateRandomString();
  users[id];
  users[id] = {
    id: id,
    password: req.body.password,
    email: req.body.email
  }
  res.cookie('user_id', id);
  res.redirect('/urls');
})

//Create new URL
app.get("/urls/new", (req, res) => {
  const templateVars = { user_id: req.cookies.user_id };
  res.render("urls_new", templateVars);
});

//When user hits submit to create a new URL it will redirect them to the urls/shortURL page
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  const short = generateRandomString();
  urlDatabase[short] = req.body.longURL;
  res.redirect(`/urls/${short}`);         // Respond with 'Ok' (we will replace this)
});

app.get("/u/:shortURL", (req, res) => {
  // const longURL = ...
  res.redirect(urlDatabase[req.params.shortURL]);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user_id: req.cookies.user_id };
  res.render("urls_show", templateVars);
});

//DELETES URL
app.post('/urls/:shortURL/delete', (req, res) => {
  const {shortURL} = req.params;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
})

//EDITS URL
app.post('/urls/:shortURL', (req, res) => {
  const {shortURL} = req.params;
  urlDatabase[shortURL] = req.body.updatedURL;
  res.redirect('/urls');
})

//LOGIN + COOKIE
app.post('/login', (req, res) => {
  res.cookie('user_id', req.body.user_id);
  res.redirect('/urls');
})

//LOGOUT
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
