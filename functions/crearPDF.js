const ejs = require('ejs');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

// Función para generar el PDF desde los datos
async function generatePdfFromData(data) {
  try {
    // Asignamos las imágenes del array al objeto data
    const imagenes = data.imagenes || [];
    for (let i = 0; i < imagenes.length; i++) {
      data[`imagen${i + 1}`] = imagenes[i][`imagen${i + 1}`] || '';
    }

    // Verificamos que las imágenes se han asignado correctamente
    console.log('Datos después de asignar las imágenes:', data);

    // Ruta al archivo de plantilla
    const templatePath = path.join(__dirname, '../public', 'template.html');

    // Leemos y procesamos la plantilla EJS
    const template = fs.readFileSync(templatePath, 'utf-8');
    const html = ejs.render(template, data);

    // Generamos el PDF a partir del HTML y lo convertimos a base64
    const base64Pdf = await generatePdf(html, data);
    return base64Pdf;

  } catch (error) {
    console.error('Error al generar el PDF:', error);
    throw new Error('Error al generar el PDF: ' + error.message);
  }
}

// Función para generar el PDF en base64 usando PDFKit
function generatePdf(htmlContent, data) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ autoFirstPage: false });
    const buffers = [];

    // Captura los datos del PDF en memoria
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      // Convierte el contenido PDF a base64
      const pdfBase64 = Buffer.concat(buffers).toString('base64');
      resolve(pdfBase64);
    });

    // Agregamos la página
    doc.addPage({ size: 'A4' });

    // Agregar texto al PDF (esto es solo un ejemplo)
    doc.fontSize(12).text(htmlContent, {
      align: 'left',
    });

    // Agregar imágenes base64 al PDF
    addImagesToPdf(doc, data);

    // Finaliza la creación del PDF
    doc.end();
  });
}

// Función para agregar imágenes base64 al PDF
function addImagesToPdf(doc, data) {
  const imagenes = ['imagen1', 'imagen2', 'imagen3', 'imagen4'];

  let yPosition = 100; // Empezamos en la parte superior del PDF

  imagenes.forEach((imagenKey, index) => {
    const base64Image = data[imagenKey];
    if (base64Image) {
      doc.image(Buffer.from(base64Image, 'base64'), {
        fit: [200, 200], // Ajusta el tamaño de la imagen (ajustable)
        align: 'center',
        valign: 'top',
        x: 100, // Ajustar la posición horizontal
        y: yPosition // Ajustar la posición vertical
      });

      yPosition += 220; // Espaciado para la siguiente imagen
    }
  });
}

module.exports = { generatePdfFromData };
