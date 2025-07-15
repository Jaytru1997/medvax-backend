// saveFile function to save file to public folder given a file and a folder name
// if folder does not exist, create it
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();

const saveFile = async (file, folder) => {
  const publicFolder = path.join(__dirname, "../../public", folder);
  if (!fs.existsSync(publicFolder)) {
    fs.mkdirSync(publicFolder, { recursive: true });
  }
  const filePath = path.join(publicFolder, file.name);
  await file.mv(filePath);

  // Get the relative path from the public folder
  const relativePath = `/${folder}/${file.name}`;
  const fileUrl = `${process.env.BACKEND_URL}${relativePath}`;
  return fileUrl;
};

module.exports = { saveFile };
