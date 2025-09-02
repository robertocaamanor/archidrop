const fs = require('fs');
const path = require('path');

function findFoldersRecursively(dir, year, monthWord) {
  let result = [];
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    if (fs.lstatSync(fullPath).isDirectory()) {
      if (item.toLowerCase().includes(year) && item.toLowerCase().includes(monthWord)) {
        result.push(fullPath);
      }
      result = result.concat(findFoldersRecursively(fullPath, year, monthWord));
    }
  }
  return result;
}

module.exports = findFoldersRecursively;
