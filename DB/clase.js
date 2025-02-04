const express = require('express');
const app = express();
const port = 80;

// Ruta principal que responde con "Hola Mundo"
app.get('/', (req, res) => {
  res.send('Hola Mundo');
});

// Inicia el servidor en el puerto 8080
app.listen(port, () => {
  console.log(`Servidor ejecutándose en http://localhost:${port}`);
});
