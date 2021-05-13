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
