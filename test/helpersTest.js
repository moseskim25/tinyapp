const { assert } = require("chai");

const { doesEmailExist } = require("../helpers/helpers.js");

const testUsers = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

describe("getUserByEmail", function() {
  it("should return a user with valid email", function() {
    const user = doesEmailExist("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.strictEqual(user.id, expectedOutput);
  });

  it("should return undefined when given an unregistered email", function() {
    const user = doesEmailExist("notexist@example.com", testUsers);
    assert.strictEqual(user.id, undefined);
  });
});
