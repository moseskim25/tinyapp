const bcrypt = require("bcrypt");

//Checks if the email already exists in users database and returns the
//user's info if it does
let doesEmailExist = function(email, database) {
  for (let user in database) {
    if (database[user].email === email) return database[user];
  }
  return false;
};

//Generates a random 6 character string to use as user's id
const generateRandomString = function() {
  return Math.random().toString(36).substr(2, 6);
};

//Authenticates user. If everything is valid then returns user's info
const authenticateUser = (email, password, database) => {
  const result = doesEmailExist(email, database);

  if (result && bcrypt.compareSync(password, result.password)) {
    return result;
  }
  return false;
};

//Checks if the url is in the database. Input the filtered database which includes
//only those urls that belong to the client. The req variable is passed along when
//the user hits EDIT in the /urls page. It includes the url id in question which is
//passed into the following function
const urlsForUser = function(db, req) {
  for (let id in db) {
    if (req.params.shortURL === id) {
      return true;
    }
  }
  return false;
};

//FILTERS URL DATABASE BY USERID
const filteredDB = function(db, userID) {
  let newDB = {};
  for (let id in db) {
    if (db[id].userID === userID) {
      newDB[id] = db[id];
    }
  }
  return newDB;
};

//Checks if a user is logged in
const isLoggedIn = function (req) {
  if (req.session.user_id) {
    return { loggedIn: true, userData: req.session.user_id };
  }
  return false;
};

module.exports = { doesEmailExist, generateRandomString, authenticateUser, urlsForUser, filteredDB, isLoggedIn };