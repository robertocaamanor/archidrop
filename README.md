# archidrop

Este proyecto permite organizar y descomprimir archivos exportados desde el celular al PC, moviéndolos automáticamente a Dropbox usando NodeJS.

## ¿Qué hace el script `procesarArchivos.js`?

- Busca archivos ZIP, JPEG y carpetas dentro de la ruta definida en el archivo `.env` (`HOME`).
- Permite elegir si quieres procesar archivos comprimidos (ZIP/JPEG) o carpetas.
- Filtra por año y mes, mostrando solo los archivos o carpetas que coinciden con la fecha seleccionada.
- Descomprime los archivos ZIP y mueve los archivos JPEG directamente a Dropbox, organizando por año, mes y nombre del diario.
- Si eliges carpetas, mueve el contenido de todas las carpetas que coincidan con el año y mes seleccionados a la carpeta correspondiente en Dropbox, sin crear subcarpetas por día.
- Evita duplicados agregando sufijos si el archivo ya existe en destino.
- Todo el proceso es interactivo y se repite hasta que el usuario decida salir.

## Uso

1. Configura el archivo `.env` con los siguientes parámetros:


```properties
USERPROFILE=C:\Users\TuUsuario
HOME=C:\Users\TuUsuario\Downloads\CarpetaExportada
```

La variable `HOME` debe apuntar a la carpeta donde están tus archivos exportados.
2. Ejecuta el script con `npm start` o `node procesarArchivos.js`.
3. Sigue las instrucciones en pantalla para organizar tus archivos en Dropbox.

### Ejemplo de uso

```bash
# Ejecutar el script
npm start

# Ejemplo de interacción:
¿Qué desea procesar? (1: Archivos ZIP/JPEG/RAR, 2: Carpetas): 1
Ingrese el año (ejemplo 1995): 1980
Seleccione el mes:
1. Enero
2. Febrero
3. Marzo
...etc
Ingrese el numero del mes (1-12): 3

# El script mostrará los archivos encontrados y preguntará si deseas procesarlos.
```

Puedes repetir el proceso para diferentes fechas y tipos de archivos/carpeta según lo que necesites organizar.
