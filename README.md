# archidrop

Este proyecto permite organizar y descomprimir archivos exportados desde el celular al PC, moviéndolos automáticamente a Dropbox usando NodeJS.

## Nueva Funcionalidad - Búsqueda Automática Unificada

El script ahora busca automáticamente archivos y carpetas con el formato específico sin necesidad de preguntas al usuario.

### ¿Qué hace el script `src/main.js`?

- **Búsqueda automática**: Busca archivos y carpetas con dos formatos válidos:
  1. `"Diario - día de mes de año"` (ej: "La Tercera - 1 de septiembre de 1995")
  2. `"Diario - mes año"` (ej: "Hombre - Septiembre 2005")
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

**Formato completo con día específico:**
- `La Tercera - 1 de septiembre de 1995.zip`
- `El Mercurio - 15 de marzo de 2000.jpg`
- `Las Últimas Noticias - 25 de diciembre de 1998/` (carpeta)

**Formato simplificado mes-año:**
- `Hombre - Septiembre 2005.zip`
- `Revista Zig-Zag - Marzo 1998.jpg`
- `Paula - Diciembre 2001/` (carpeta)

### Ejemplo de salida:
```
=== ELEMENTOS ENCONTRADOS ===

📅 Año 1995:
  📆 09 - Septiembre:
    📰 La Tercera:
      📦 La Tercera - 1 de septiembre de 1995.zip (1 de septiembre)
      📄 La Tercera - 2 de septiembre de 1995.jpg (2 de septiembre)

📅 Año 2005:
  📆 09 - Septiembre:
    📰 Hombre:
      📦 Hombre - Septiembre 2005.zip (septiembre)
      📄 Hombre - Septiembre 2005.jpg (septiembre)

¿Desea procesar estos elementos y moverlos a Dropbox? (S/N):
```
