const { getCreditosFromCache } = require("../DB/consultas-BD");
const { apigeneral } = require("../DB/dataapp");

let cachedCreditos = {};
let cardReniec = {}; // Las tarjetas estarán aquí.

async function obtenerCreditos() {
  try {
    cachedCreditos = await getCreditosFromCache(); // Obtener los créditos desde el cache
    cardReniec = {
      tarjeta1: {
        icon: "Icons.directions_car",
        title: "Buscar Placa",
        subtitle: "Buscar por Placa",
        description:
          "Obten los datos del propietario del vehiculo.",
        cost: `${cachedCreditos.rq} créditos`,
        BusquedaPage: {
          titulo: "Buscar Placa",
          api: `${apigeneral}/placa-simple`,
          campos: {
            dni: { label: "Placa", type: "placa" },
          },
        },
        buildBackCard: {
          json: {
            oficina: "LIMA",
            numPart: "52815264",
            tiv: "2022|2818526|57827297",
          },
        },
      },tarjeta2: {
        icon: "Icons.directions_car",
        title: "Buscar Tive",
        subtitle: "Buscar por Placa",
        description:
          "Documento digital que identifica a un vehículo y que se emite por la Superintendencia Nacional de los Registros Públicos.",
        cost: `${cachedCreditos.rq} créditos`,
        BusquedaPage: {
          titulo: "Buscar Tive",
          api: `${apigeneral}/tive`,
          comprobar: true,
          campos: {
            dni: { label: "Placa", type: "placa" },
          },
        },
        buildBackCard: {
          json: {
            oficina: "LIMA",
            numPart: "52815264",
            tiv: "2022|2818526|57827297",
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
