const fs = require('fs');
const path = require('path');

function moveFile(srcFile, destDir) {
  try {
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
    const destFile = path.join(destDir, path.basename(srcFile));
    fs.renameSync(srcFile, destFile);
    console.log(`Movido: ${srcFile} → ${destFile}`);
  } catch (err) {
    console.error(`Error moviendo ${srcFile}:`, err.message);
  }
}

module.exports = moveFile;
