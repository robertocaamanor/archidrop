const fs = require('fs');
const AdmZip = require('adm-zip');
const path = require('path');

function decompressFile(srcFile, destDir) {
  try {
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
    
    const ext = path.extname(srcFile).toLowerCase();
    
    if (ext === '.zip') {
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
      console.log(`Descomprimido ZIP: ${srcFile} → ${destDir}`);
    } else if (ext === '.rar') {
      // Para archivos RAR, los movemos sin descomprimir por ahora
      const fileName = path.basename(srcFile);
      const destPath = path.join(destDir, fileName);
      fs.renameSync(srcFile, destPath);
      console.log(`Movido RAR (sin descomprimir): ${srcFile} → ${destPath}`);
      console.log('  ⚠️  Los archivos RAR se mueven sin descomprimir. Descomprima manualmente si es necesario.');
    } else {
      throw new Error(`Formato de archivo no soportado: ${ext}`);
    }
  } catch (err) {
    console.error(`Error procesando ${srcFile}:`, err.message);
  }
}

// Mantener compatibilidad con el nombre anterior
function decompressZip(srcFile, destDir) {
  decompressFile(srcFile, destDir);
}

module.exports = decompressZip;
module.exports.decompressFile = decompressFile;
