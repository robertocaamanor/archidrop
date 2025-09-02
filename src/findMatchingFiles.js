const fs = require('fs');
const path = require('path');

function findMatchingFiles(HOME, year, monthWord) {
  let matchFiles = [];
  const maxDepth = 5;
  function searchDir(dir, depth) {
    if (depth > maxDepth) return;
    let items = [];
    try {
      items = fs.readdirSync(dir);
    } catch (err) {
      return;
    }
    for (const item of items) {
      const fullPath = path.join(dir, item);
      let stat;
      try {
        stat = fs.lstatSync(fullPath);
      } catch (err) {
        continue;
      }
      if (stat.isDirectory()) {
        if (fullPath === HOME) {
          console.log(`Buscando en: ${fullPath}`);
          searchDir(fullPath, depth + 1);
        }
      } else {
        if (!(/\.(zip|jpg|jpeg)$/i).test(item)) continue;
        const nameLower = item.toLowerCase();
        if (nameLower.includes(year) && nameLower.includes(monthWord)) {
          matchFiles.push(fullPath);
        }
      }
    }
  }
  searchDir(HOME, 0);
  return matchFiles;
}

module.exports = findMatchingFiles;
