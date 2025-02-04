const { getCreditosFromCache } = require("../DB/consultas-BD");
const { apigeneral } = require("../DB/dataapp");

let cachedCreditos = {};
let cardReniec = {}; // Las tarjetas estarán aquí.

async function obtenerCreditos() {
  try {
    cachedCreditos = await getCreditosFromCache(); // Obtener los créditos desde el cache
    cardReniec = {
      mantenimiento: true,
      tarjeta1: {
        icon: "Icons.contact_page_outlined",
        title: "Buscar DNI",
        subtitle: "Buscar por nombre y apellido",
        description:
          "Te permite obtener datos del DNI ingresando nombres y apellidos.",
        cost: `${cachedCreditos.buscar_dni_por_nm} créditos`,
        BusquedaPage: {
          titulo: "Buscar por nombre y apellido",
          api: `${apigeneral}/financiero`,
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
            Edad: 66,
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
