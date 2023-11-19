var fs = require("fs");


async function readFile() {
  return new Promise((resolve, reject) => {
    fs.readFile('./data.xml', 'utf8', function (err, data) {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
}

async function saveFile(newContent) {
  return new Promise((resolve, reject) => {
    fs.writeFile('./data.xml', newContent, function (err, data) {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
}


module.exports = {
  readXmlFile: readFile,
  saveXmlFile: saveFile
}