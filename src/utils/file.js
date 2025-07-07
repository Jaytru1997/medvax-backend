// saveFile function to save file to public folder given a file and a folder name
// if folder does not exist, create it
const fs = require("fs");
const path = require("path");
exports.saveFile = async (file, folder) => {
  //make sure that public is in root of the project
  const filePath = path.join(__dirname, "../../public", folder, file.name);
  //   console.log(filePath);
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath, { recursive: true });
  }
  await file.mv(filePath);
  return filePath;
};
