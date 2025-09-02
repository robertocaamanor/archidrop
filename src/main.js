const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const prompt = require('prompt-sync')({sigint: true});
require('dotenv').config({ path: path.join(__dirname, '../.env') });

let HOME = (require('fs').readFileSync(path.join(__dirname, '../.env'), 'utf8')
  .split(/\r?\n/)
  .find(line => line.startsWith('HOME=')) || '').replace('HOME=', '').trim();
if (!HOME) HOME = process.cwd();
if (!path.isAbsolute(HOME)) {
  HOME = path.resolve(__dirname, HOME);
}
const DROPBOX = path.join(process.env.USERPROFILE, 'Dropbox', 'Archivos');

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

const moveFolderContents = require('../utils/moveFolderContents');
const moveFile = require('../utils/moveFile');
const decompressZip = require('../utils/decompressZip');
const sanitizeName = require('../utils/sanitizeName');
const findMatchingFiles = require('./findMatchingFiles');
const findFoldersRecursively = require('./findFoldersRecursively');

console.log(`Ruta HOME utilizada: ${HOME}`);
if (!fs.existsSync(HOME)) {
  console.error(`La carpeta HOME no existe: ${HOME}`);
  prompt('Presione Enter para salir...');
  process.exit(1);
}
prompt('Presione Enter para continuar...');

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
      const matchedFiles = findMatchingFiles(HOME, year, monthObj.word);
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
        const diario = baseName.split(' - ')[0];
        const safeDiario = sanitizeName(diario);
        const diarioDir = path.join(DROPBOX, year, monthObj.name, safeDiario);
        if (!fs.existsSync(diarioDir)) fs.mkdirSync(diarioDir, { recursive: true });

        if (/\.zip$/i.test(filePath)) {
          decompressZip(filePath, diarioDir);
        } else {
          moveFile(filePath, diarioDir);
        }
      }
    } else if (tipo === '2') {
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
