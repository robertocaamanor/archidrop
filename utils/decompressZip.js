const fs = require('fs');
const AdmZip = require('adm-zip');
const path = require('path');

function decompressZip(srcFile, destDir) {
  try {
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
    const zip = new AdmZip(srcFile);
    const zipEntries = zip.getEntries();
    zipEntries.forEach(entry => {
      if (!entry.isDirectory) {
        const fileName = path.basename(entry.entryName);
        const entryPath = path.join(destDir, fileName);
        fs.writeFileSync(entryPath, entry.getData());
      }
    });
    fs.unlinkSync(srcFile);
    console.log(`Descomprimido: ${srcFile} → ${destDir}`);
  } catch (err) {
    console.error(`Error descomprimiendo ${srcFile}:`, err.message);
  }
}

module.exports = decompressZip;
