# archidrop

Este proyecto permite organizar y descomprimir archivos exportados desde el celular al PC, moviéndolos automáticamente a Dropbox usando NodeJS.

## Nueva Funcionalidad - Búsqueda Automática Unificada

El script ahora busca automáticamente archivos y carpetas con el formato específico sin necesidad de preguntas al usuario.

### ¿Qué hace el script `src/main.js`?

- **Búsqueda automática**: Busca archivos y carpetas con el formato `"Diario - día de mes de año"`
- **Unificada**: Procesa tanto archivos (ZIP, JPEG, RAR) como carpetas en una sola ejecución
- **Organización inteligente**: Agrupa automáticamente por año, mes y diario
- **Vista previa**: Muestra una lista organizada de todos los elementos encontrados
- **Confirmación simple**: Solo pregunta si desea procesar y mover a Dropbox

### Formatos soportados
- **Archivos ZIP**: Se descomprimen automáticamente
- **Archivos JPEG**: Se mueven directamente
- **Archivos RAR**: Se mueven sin descomprimir (con aviso)
- **Carpetas**: Se mueve todo el contenido

### Estructura de organización
```
Dropbox/Archivos/
├── 1995/
│   └── 09 - Septiembre/
│       └── La Tercera/
│           ├── archivo1.jpg
│           ├── archivo2.pdf
│           └── ...
└── 1997/
    └── 09 - Septiembre/
        └── La Tercera/
            └── ...
```

## Uso

1. Configura el archivo `.env`:

```properties
USERPROFILE=C:\Users\TuUsuario
HOME=${USERPROFILE}\Downloads\Phone Link
```

2. Ejecuta el script:

```bash
npm start
# o
node src/main.js
```

3. El script automáticamente:
   - Busca archivos y carpetas con formato válido
   - Muestra una vista previa organizada
   - Pregunta si desea procesar los elementos
   - Organiza todo en Dropbox según año/mes/diario

### Ejemplo de formato válido de archivos/carpetas:
- `La Tercera - 1 de septiembre de 1995.zip`
- `El Mercurio - 15 de marzo de 2000.jpg`
- `Las Últimas Noticias - 25 de diciembre de 1998/` (carpeta)

### Ejemplo de salida:
```
=== ELEMENTOS ENCONTRADOS ===

📅 Año 1995:
  📆 09 - Septiembre:
    📰 La Tercera:
      📦 La Tercera - 1 de septiembre de 1995.zip
      📄 La Tercera - 2 de septiembre de 1995.jpg

¿Desea procesar estos elementos y moverlos a Dropbox? (S/N):
```
