//Checks if the email already exists in users database and returns the
//user's info if it does
let doesEmailExist = function (email, database) {
  for (let user in database) {
    if (database[user].email === email) return database[user];
  }
  return false;
};

module.exports = { doesEmailExist };