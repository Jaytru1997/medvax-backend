const Blacklist = require("../models/Blacklist");

const blacklistToken = async (token) => {
  try {
    const newEntry = new Blacklist({ token });
    await newEntry.save();
    console.log("Token blacklisted successfully.");
  } catch (error) {
    console.error("Error blacklisting token:", error.message);
  }
};

// const isTokenBlacklisted = async (token) => {
//   try {
//     const tokenExists = await Blacklist.findOne({ token });
//     return !!tokenExists; // Returns true if the token exists in the blacklist
//   } catch (error) {
//     console.error("Error checking token blacklist:", error.message);
//     return false; // Assume token is not blacklisted if there's an error
//   }
// };

module.exports = { blacklistToken /*isTokenBlacklisted */ };
