const fs = require('fs');
const path = require('path');

function moveFolderContents(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return;
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  const files = fs.readdirSync(srcDir);
  for (const file of files) {
    const srcFile = path.join(srcDir, file);
    const destFile = path.join(destDir, file);
    if (!fs.existsSync(srcFile)) {
      console.warn(`Archivo no encontrado: ${srcFile}`);
      continue;
    }
    if (fs.lstatSync(srcFile).isFile()) {
      let finalDestFile = destFile;
      let count = 1;
      while (fs.existsSync(finalDestFile)) {
        const ext = path.extname(file);
        const name = path.basename(file, ext);
        finalDestFile = path.join(destDir, `${name}_${count}${ext}`);
        count++;
      }
      try {
        fs.renameSync(srcFile, finalDestFile);
        console.log(`Movido: ${srcFile} → ${finalDestFile}`);
      } catch (err) {
        console.error(`Error moviendo ${srcFile}:`, err.message);
      }
    }
  }
}

module.exports = moveFolderContents;
