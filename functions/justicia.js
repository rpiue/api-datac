const { getCreditosFromCache } = require("../DB/consultas-BD");
const { apigeneral } = require("../DB/dataapp");

let cachedCreditos = {};
let cardReniec = {}; // Las tarjetas estarán aquí.

async function obtenerCreditos() {
  try {
    cachedCreditos = await getCreditosFromCache(); // Obtener los créditos desde el cache
    cardReniec = {
      //mantenimiento: true,
      tarjeta1: {
        icon: "Icons.contact_page_outlined",
        title: "Buscar RQ",
        subtitle: "Buscar por DNI",
        description: "Te permite obtener datos QR.",
        cost: `${cachedCreditos.rq} créditos`,
        BusquedaPage: {
          titulo: "Buscar RQ",
          api: `${apigeneral}/rq`,
          campos: {
            dni: { label: "DNI", type: "number", maxLength: 8 },
          },
        },
        buildBackCard: {
          json: {
            dni: "06487153",
            apePaterno: "PEDRO ANTONIO",
            apeMaterno: "CASTILLO",
            preNombres: "TERRONES",
            pdf: 'Codigo PDF',
          },
        },
      },
      tarjeta2: {
        icon: "Icons.contact_page_outlined",
        title: "Buscar RQ Placa",
        subtitle: "Buscar por DNI",
        description: "Te permite obtener datos QR.",
        cost: `${cachedCreditos.rq_vehiculos} créditos`,
        BusquedaPage: {
          titulo: "Buscar RQ Placa",
          api: `${apigeneral}/rq-placa`,
          campos: {
            dni: { label: "Placa", type: "placa", maxLength: 8 },
          },
        },
        buildBackCard: {
          json: {
            dni: "06487153",
            apePaterno: "PEDRO ANTONIO",
            apeMaterno: "CASTILLO",
            preNombres: "TERRONES",
            pdf: 'Codigo PDF',
          },
        },
      },
      tarjeta3: {
        icon: "Icons.contact_page_outlined",
        title: "Buscar Antecedentes",
        subtitle: "Buscar por DNI",
        description: "Te permite obtener datos de los antecedentes.",
        cost: `${cachedCreditos.antecedentes_sinpol} créditos`,
        BusquedaPage: {
          titulo: "Buscar Antecedentes",
          api: `${apigeneral}/antece`,
          campos: {
            dni: { label: "DNI", type: "number", maxLength: 8 },
          },
        },
        buildBackCard: {
          json: {
            dni: "06487153",
            apePaterno: "PEDRO ANTONIO",
            apeMaterno: "CASTILLO",
            preNombres: "TERRONES",
            pdf: 'Codigo PDF',
          },
        },
      },
    };
  } catch (error) {
    console.error("Error al obtener los créditos:", error.message);
  }
}

// Exportamos la función que obtiene las tarjetas de forma asincrónica
async function obtenerTarjetas() {
  await obtenerCreditos(); // Esperamos a que los créditos estén listos
  return cardReniec; // Devolvemos las tarjetas ya completas
}

module.exports = {
  obtenerTarjetas,
};
