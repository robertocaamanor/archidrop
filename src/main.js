const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const prompt = require('prompt-sync')({sigint: true});
require('dotenv').config({ path: path.join(__dirname, '../.env') });

let HOME = (require('fs').readFileSync(path.join(__dirname, '../.env'), 'utf8')
  .split(/\r?\n/)
  .find(line => line.startsWith('HOME=')) || '').replace('HOME=', '').trim();
if (HOME.includes('${USERPROFILE}')) {
  HOME = HOME.replace('${USERPROFILE}', process.env.USERPROFILE);
}
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
const { decompressFile } = require('../utils/decompressZip');
const sanitizeName = require('../utils/sanitizeName');

console.log(`Ruta HOME utilizada: ${HOME}`);
if (!fs.existsSync(HOME)) {
  console.error(`La carpeta HOME no existe: ${HOME}`);
  prompt('Presione Enter para salir...');
  process.exit(1);
}

// Función para parsear información de fecha del nombre
function parseFileInfo(name) {
  // Patrón 1: "Diario - [día] de [mes] de [año]"
  const datePattern1 = /(.+?)\s*-\s*(\d{1,2})\s+de\s+(\w+)\s+de\s+(\d{4})/i;
  // Patrón 2: "Diario - [mes] [año]"
  const datePattern2 = /(.+?)\s*-\s*(\w+)\s+(\d{4})/i;
  
  const match1 = name.match(datePattern1);
  const match2 = name.match(datePattern2);
  
  if (match1) {
    // Formato: "La Tercera - 1 de septiembre de 1995"
    const [, diario, dia, mesTexto, year] = match1;
    const monthObj = MONTHS.find(m => m.word.toLowerCase() === mesTexto.toLowerCase());
    
    if (!monthObj) return null;
    
    return {
      diario: diario.trim(),
      dia: parseInt(dia),
      mes: monthObj,
      year: parseInt(year),
      fullDate: `${dia} de ${mesTexto} de ${year}`,
      format: 'completo'
    };
  } else if (match2) {
    // Formato: "Hombre - Septiembre 2005"
    const [, diario, mesTexto, year] = match2;
    const monthObj = MONTHS.find(m => m.word.toLowerCase() === mesTexto.toLowerCase());
    
    if (!monthObj) return null;
    
    return {
      diario: diario.trim(),
      dia: null, // No hay día específico
      mes: monthObj,
      year: parseInt(year),
      fullDate: `${mesTexto} ${year}`,
      format: 'mes-año'
    };
  }
  
  return null;
}

// Función unificada para buscar archivos y carpetas
function findMatchingItems(dir, depth = 0, maxDepth = 5) {
  if (depth > maxDepth) return [];
  
  let results = [];
  let items = [];
  
  try {
    items = fs.readdirSync(dir);
  } catch (err) {
    return results;
  }
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    let stat;
    
    try {
      stat = fs.lstatSync(fullPath);
    } catch (err) {
      continue;
    }
    
    const fileInfo = parseFileInfo(item);
    
    if (stat.isDirectory()) {
      // Si es carpeta y coincide con el patrón
      if (fileInfo) {
        results.push({
          type: 'folder',
          path: fullPath,
          name: item,
          info: fileInfo
        });
      }
      // Buscar recursivamente en subcarpetas
      results = results.concat(findMatchingItems(fullPath, depth + 1, maxDepth));
    } else {
      // Si es archivo y coincide con el patrón y extensión válida
      if (fileInfo && /\.(zip|jpg|jpeg|rar)$/i.test(item)) {
        results.push({
          type: 'file',
          path: fullPath,
          name: item,
          info: fileInfo
        });
      }
    }
  }
  
  return results;
}

// Función para agrupar items por año, mes y diario
function groupItemsByDate(items) {
  const grouped = {};
  
  items.forEach(item => {
    const { year, mes, diario } = item.info;
    const yearKey = year.toString();
    const monthKey = mes.name;
    const diarioKey = diario;
    
    if (!grouped[yearKey]) grouped[yearKey] = {};
    if (!grouped[yearKey][monthKey]) grouped[yearKey][monthKey] = {};
    if (!grouped[yearKey][monthKey][diarioKey]) grouped[yearKey][monthKey][diarioKey] = [];
    
    grouped[yearKey][monthKey][diarioKey].push(item);
  });
  
  return grouped;
}

function main() {
  while (true) {
    console.clear();
    console.log('Buscando archivos y carpetas con formato "Diario - día de mes de año"...\n');
    
    const matchedItems = findMatchingItems(HOME);
    
    if (matchedItems.length === 0) {
      console.log('No se encontraron archivos o carpetas con el formato esperado.');
      prompt('Presione Enter para salir...');
      break;
    }
    
    // Agrupar por fecha
    const groupedItems = groupItemsByDate(matchedItems);
    
    // Mostrar resumen
    console.log('=== ELEMENTOS ENCONTRADOS ===\n');
    Object.keys(groupedItems).sort().forEach(year => {
      console.log(`📅 Año ${year}:`);
      Object.keys(groupedItems[year]).sort().forEach(month => {
        console.log(`  📆 ${month}:`);
        Object.keys(groupedItems[year][month]).sort().forEach(diario => {
          const items = groupedItems[year][month][diario];
          console.log(`    📰 ${diario}:`);
          items.forEach(item => {
            const icon = item.type === 'folder' ? '📁' : (item.name.toLowerCase().endsWith('.zip') ? '📦' : (item.name.toLowerCase().endsWith('.rar') ? '�' : '�📄'));
            const formatInfo = item.info.format === 'completo' ? ` (${item.info.dia} de ${item.info.mes.word})` : ` (${item.info.mes.word})`;
            console.log(`      ${icon} ${item.name}${formatInfo}`);
          });
        });
      });
      console.log('');
    });
    
    const shouldProcess = prompt('¿Desea procesar estos elementos y moverlos a Dropbox? (S/N): ').toLowerCase();
    if (shouldProcess !== 's') {
      console.log('Proceso cancelado.');
      break;
    }
    
    // Procesar cada elemento
    let processedCount = 0;
    Object.keys(groupedItems).forEach(year => {
      Object.keys(groupedItems[year]).forEach(monthName => {
        Object.keys(groupedItems[year][monthName]).forEach(diario => {
          const items = groupedItems[year][monthName][diario];
          const safeDiario = sanitizeName(diario);
          const targetDir = path.join(DROPBOX, year, monthName, safeDiario);
          
          if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
          }
          
          items.forEach(item => {
            console.log(`Procesando: ${item.name}`);
            
            if (item.type === 'file') {
              if (/\.(zip|rar)$/i.test(item.path)) {
                decompressFile(item.path, targetDir);
              } else {
                moveFile(item.path, targetDir);
              }
            } else if (item.type === 'folder') {
              moveFolderContents(item.path, targetDir);
            }
            
            processedCount++;
          });
        });
      });
    });
    
    console.log(`\n=== Proceso finalizado ===`);
    console.log(`Se procesaron ${processedCount} elementos.`);
    
    const continuar = prompt('\n¿Desea buscar nuevamente? (S/N): ').toLowerCase();
    if (continuar !== 's') break;
  }
}

main();
