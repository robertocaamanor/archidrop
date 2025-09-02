// Mueve todos los archivos de una carpeta origen a una carpeta destino
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
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const prompt = require('prompt-sync')({sigint: true});

// Cargar .env desde la ruta del script
require('dotenv').config({ path: path.join(__dirname, '.env') });
// Forzar que HOME siempre sea el valor del archivo .env
let HOME = (require('fs').readFileSync(path.join(__dirname, '.env'), 'utf8')
  .split(/\r?\n/)
  .find(line => line.startsWith('HOME=')) || '').replace('HOME=', '').trim();
if (!HOME) HOME = process.cwd();
if (!path.isAbsolute(HOME)) {
  HOME = path.resolve(__dirname, HOME);
}
const DROPBOX = path.join(process.env.USERPROFILE || process.env.HOME || __dirname, 'Dropbox', 'Archivos');


// Diagnóstico de la ruta HOME
console.log(`Ruta HOME utilizada: ${HOME}`);
if (!fs.existsSync(HOME)) {
  console.error(`La carpeta HOME no existe: ${HOME}`);
  prompt('Presione Enter para salir...');
  process.exit(1);
}
prompt('Presione Enter para continuar...');

const MONTHS = [
  { num: 1, word: 'enero', name: '01 - Enero' },
  { num: 2, word: 'febrero', name: '02 - Febrero' },
  { num: 3, word: 'marzo', name: '03 - Marzo' },
  { num: 4, word: 'abril', name: '04 - Abril' },
  { num: 5, word: 'mayo', name: '05 - Mayo' },
  { num: 6, word: 'junio', name: '06 - Junio' },
  { num: 7, word: 'julio', name: '07 - Julio' },
  { num: 8, word: 'agosto', name: '08 - Agosto' },
  { num: 9, word: 'septiembre', name: '09 - Septiembre' },
  { num: 10, word: 'octubre', name: '10 - Octubre' },
  { num: 11, word: 'noviembre', name: '11 - Noviembre' },
  { num: 12, word: 'diciembre', name: '12 - Diciembre' }
];

// Función para sanitizar nombres de carpeta
function sanitizeName(name) {
  return name.replace(/[\\\/:*?"<>|]/g, '_');
}

// Función para descomprimir zip
function decompressZip(srcFile, destDir) {
  try {
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
    const zip = new AdmZip(srcFile);
    const zipEntries = zip.getEntries();
    zipEntries.forEach(entry => {
      if (!entry.isDirectory) {
        // Extraer solo el nombre del archivo, sin carpetas internas
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

function findMatchingFiles(year, monthWord) {
  let matchFiles = [];
  const maxDepth = 5;
  function searchDir(dir, depth) {
    if (depth > maxDepth) return;
    let items = [];
    try {
      items = fs.readdirSync(dir);
    } catch (err) {
      // No se puede acceder a la carpeta, ignorar
      return;
    }
    for (const item of items) {
      const fullPath = path.join(dir, item);
      let stat;
      try {
        stat = fs.lstatSync(fullPath);
      } catch (err) {
        // No se puede acceder al archivo/carpeta, ignorar
        continue;
      }
      // Limitar la búsqueda solo a la carpeta HOME y sus subcarpetas
      if (stat.isDirectory()) {
        // Solo buscar dentro de HOME y sus subcarpetas
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

function main() {
  while (true) {
    console.clear();
    const tipo = prompt('¿Qué desea procesar? (1: Archivos ZIP/JPEG/RAR, 2: Carpetas): ');
    if (tipo !== '1' && tipo !== '2') {
      console.log('Opción inválida.');
      continue;
    }

    const year = prompt('Ingrese el año (ejemplo 1995): ');
    if (!/^\d{4}$/.test(year)) {
      console.log('Año inválido.');
      continue;
    }

    console.log('Seleccione el mes:');
    MONTHS.forEach(m => console.log(`${m.num}. ${m.name.split(' - ')[1]}`));
    const monthNum = parseInt(prompt('Ingrese el numero del mes (1-12): '), 10);
    const monthObj = MONTHS.find(m => m.num === monthNum);
    if (!monthObj) {
      console.log('Mes inválido.');
      continue;
    }

    if (tipo === '1') {
      const matchedFiles = findMatchingFiles(year, monthObj.word);
      if (matchedFiles.length === 0) {
        console.log(`No se encontraron archivos para ${monthObj.word} ${year}.`);
        prompt('Presione Enter para continuar...');
        continue;
      }

      console.log(`\n=== Vista previa de archivos que coinciden con "${monthObj.word} ${year}" ===`);
      matchedFiles.forEach(f => console.log('  ' + f));

      const resp = prompt(`\n¿Desea procesar estos archivos en ${HOME}? (S/N): `).toLowerCase();
      if (resp !== 's') {
        console.log('Proceso cancelado.');
        break;
      }

      for (const filePath of matchedFiles) {
        const baseName = path.parse(filePath).name;
        // Extraer nombre del diario (antes del primer ' - ')
        const diario = baseName.split(' - ')[0];
        const safeDiario = sanitizeName(diario);
        const diarioDir = path.join(DROPBOX, year, monthObj.name, safeDiario);
        // Crear la carpeta del diario si no existe
        if (!fs.existsSync(diarioDir)) fs.mkdirSync(diarioDir, { recursive: true });

        if (/\.zip$/i.test(filePath)) {
          decompressZip(filePath, diarioDir);
        } else {
          moveFile(filePath, diarioDir);
        }
      }
    } else if (tipo === '2') {
      // Buscar carpetas recursivamente en HOME y subcarpetas que contengan mes y año
      function findFoldersRecursively(dir, year, monthWord) {
        let result = [];
        const items = fs.readdirSync(dir);
        for (const item of items) {
          const fullPath = path.join(dir, item);
          if (fs.lstatSync(fullPath).isDirectory()) {
            if (item.toLowerCase().includes(year) && item.toLowerCase().includes(monthWord)) {
              result.push(fullPath);
            }
            // Buscar en subcarpetas
            result = result.concat(findFoldersRecursively(fullPath, year, monthWord));
          }
        }
        return result;
      }

      const folders = findFoldersRecursively(HOME, year, monthObj.word);
      if (folders.length === 0) {
        console.log(`No se encontraron carpetas para ${monthObj.word} ${year}.`);
        prompt('Presione Enter para continuar...');
        continue;
      }

      console.log(`\n=== Carpetas que coinciden con "${monthObj.word} ${year}" ===`);
      folders.forEach(f => console.log('  ' + f));

      const resp = prompt(`\n¿Desea mover el contenido de estas carpetas al Dropbox? (S/N): `).toLowerCase();
      if (resp !== 's') {
        console.log('Proceso cancelado.');
        break;
      }

      for (const folderPath of folders) {
        // Extraer nombre del diario (antes del primer ' - ')
        const folderName = path.basename(folderPath);
        const diario = folderName.split(' - ')[0];
        const safeDiario = sanitizeName(diario);
        const diarioDir = path.join(DROPBOX, year, monthObj.name, safeDiario);
        moveFolderContents(folderPath, diarioDir);
      }
    }

    console.log('\n=== Proceso finalizado ===');
    const otra = prompt('\n¿Desea procesar otra fecha o tipo? (S/N): ').toLowerCase();
    if (otra !== 's') break;
  }
}

main();
