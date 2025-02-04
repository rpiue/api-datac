const { getCreditosFromCache } = require("../DB/consultas-BD");
const { apigeneral } = require("../DB/dataapp");

let cachedCreditos = {};
let cardReniec = {}; // Las tarjetas estarán aquí.

async function obtenerCreditos() {
  try {
    cachedCreditos = await getCreditosFromCache(); // Obtener los créditos desde el cache
    cardReniec = {
      tarjeta1: {
        icon: "Icons.phone",
        title: "Buscar por DNI o Numero",
        subtitle: "Buscar por DNI y numero",
        description:
          "Te permite obtener los numeros telefonicos de acuerdo al DNI.",
        cost: `${cachedCreditos.tel} créditos`,
        BusquedaPage: {
          titulo: "Buscar por DNI o Numero",
          api: `${apigeneral}/telefono-simple`,
          api2: `${apigeneral}/consulta-dni`,
          comprobar: true,
          campos: {
            dni: { label: "DNI o Telefono", type: "number", maxLength: 9 },
          },
        },
        buildBackCard: {
          json: {
            datos: {
              dni: "42090656",
              titular: "NESTOR ALVARO SANDOVAL VILCARANA",
              number: "949444084",
              operator: "movistar",
              type: "",
              plan: "Postpago",
            },
          },
        },
      },
      tarjeta2: {
        icon: "Icons.phone",
        title: "Movistar",
        subtitle: "Consultar datos en tiempo real",
        description: "Obtén información del telefono por dni o numero.",
        cost: `${cachedCreditos.tel_tiemp_real} créditos`,
        BusquedaPage: {
          titulo: "Movistar",
          api: `${apigeneral}/movistar`,
          api2: `${apigeneral}/consulta-dni`,
          campos: {
            dni: { label: "DNI o Telefono", type: "number", maxLength: 9 },
          },
        },
        buildBackCard: {
          json: {
            coId: "MIG000021615762",
            fecActivacion: null,
            idCuenta: "31816549",
            modo: "Postpago",
            nomProducto: "991831785",
            nuCel: "51991831785",
            nuServicio: "51991831785",
            señalTegnologia: "GSM",
            tipoLinea: "Línea CONTROL",
          },
        },
      },
      tarjeta3: {
        icon: "Icons.phone",
        title: "Bitel",
        subtitle: "Consultar datos en tiempo real",
        description: "Obtén información del telefono por dni.",
        cost: `${cachedCreditos.tel_tiemp_real} créditos`,
        BusquedaPage: {
          titulo: "Bitel",
          api: `${apigeneral}/bitel`,
          api2: `${apigeneral}/consulta-dni`,
          campos: {
            dni: { label: "Telefono", type: "number", maxLength: 9 },
          },
        },
        buildBackCard: {
          json: {
            coId: "MIG000021615762",
            fecActivacion: null,
            idCuenta: "31816549",
            modo: "Postpago",
            nomProducto: "991831785",
            nuCel: "51991831785",
            nuServicio: "51991831785",
            señalTegnologia: "GSM",
            tipoLinea: "Línea CONTROL",
          },
        },
      },
      tarjeta4: {
        icon: "Icons.phone",
        title: "Claro",
        subtitle: "Datos mas detallados con dni o numero",
        description:
          "Obtén información del telefono por dni.",
        cost: `${cachedCreditos.ospitel_plus} créditos`,
        BusquedaPage: {
          titulo: "Bucar por DNI Plus",
          api: `${apigeneral}/claro`,
          api2: `${apigeneral}/consulta-dni`,
          campos: {
            dni: { label: "DNI", type: "number", maxLength: 8 },
          },
        },
        buildBackCard: {
          json: {
            claro: {
              coId: "MIG000021615762",
              fecActivacion: null,
              idCuenta: "31816549",
              modo: "Postpago",
              nomProducto: "991831785",
              nuCel: "51991831785",
              nuServicio: "51991831785",
              señalTegnologia: "GSM",
              tipoLinea: "Línea CONTROL",
            },
            
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
