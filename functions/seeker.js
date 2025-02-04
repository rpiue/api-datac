const { getCreditosFromCache } = require("../DB/consultas-BD");
const { apigeneral } = require("../DB/dataapp");

let cachedCreditos = {};
let cardReniec = {}; // Las tarjetas estarán aquí.

async function obtenerCreditos() {
  try {
    cachedCreditos = await getCreditosFromCache(); // Obtener los créditos desde el cache
    cardReniec = {
      tarjeta1: {
        icon: "Icons.contact_page_outlined",
        title: "Buscar DNI",
        subtitle: "Buscar por nombre y apellido",
        description:
          "Te permite obtener datos del DNI ingresando nombres y apellidos.",
        cost: `${cachedCreditos.seeker} créditos`,
        BusquedaPage: {
          titulo: "Buscar por nombre y apellido",
          api: `${apigeneral}/seeker`,
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
      tarjeta2: {
        icon: "Icons.phone",
        title: "Buscar Telefono",
        subtitle: "Consultar datos de telefonos con Seeker",
        description:
          "Obtén información del Numero telefonico",
        cost: `${cachedCreditos.seeker} créditos`,
        BusquedaPage: {
          titulo: "Buscar por DNI",
          api: `${apigeneral}/seeker-telefono`,
          campos: {
            dni: { label: "Telefono", type: "number", maxLength: 9 },
          },
        },
        buildBackCard: {
          json: {
            dni: "27427864-7",
            nombres: "JOSE PEDRO",
            apellido_paterno: "CASTILLO",
            apellido_materno: "TERRONES",
            genero: "MASCULINO",
            fecha_nacimiento: "19/10/1969 - 53",
            departamento: "CAJAMARCA",
            provincia: "CHOTA",
            distrito: "TACABAMBA",
            grado_instruccion: "SUPERIOR COMPLETA",
            estado_civil: "CASADO",
            estatura: "166m",
            fecha_inscripcion: "27/11/1997",
            fecha_emision: "20/07/2021",
            fecha_caducidad: "20/07/2029",
            padre: "IRENEO",
            madre: "MAVILA",
            restriccion: "NINGUNA",
            departamento_n: "CAJAMARCA",
            provincia_n: "CHOTA",
            distrito_n: "TACABAMBA",
            direccion_n: "CASERIO PUÑA",
            ubigeo_reniec: "060615",
            ubigeo_inei: "060417",
            ubigeo_sunat: "060417",
            codigo_postal: "6135",
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
