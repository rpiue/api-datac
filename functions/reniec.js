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
        cost: `${cachedCreditos.buscar_dni_por_nm} créditos`,
        BusquedaPage: {
          titulo: "Buscar por nombre y apellido",
          api: `${apigeneral}/consulta-reniec`,
          api2: `${apigeneral}/consulta-dni`,
          boton: "Obtener C4",
          campos: {
            nombre: { label: "Nombre", type: "text" },
            ap_pat: { label: "Apellido Paterno", type: "text" },
            ap_mat: { label: "Apellido Materno", type: "text" },
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
        icon: "Icons.assignment_outlined",
        title: "Ver Información",
        subtitle: "Consultar datos generales",
        description:
          "Obtén información del DNI, incluyendo nombres, apellidos, género, fecha de nacimiento, dirección, estado civil, nombres de los padres y una foto de perfil.",
        cost: `${cachedCreditos.dni_simple} créditos`,
        BusquedaPage: {
          titulo: "Bucar DNI",
          api: `${apigeneral}/consulta-dni`,

          campos: {
            dni: { label: "DNI", type: "number", maxLength: 8 },
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
      tarjeta3: {
        icon: "Icons.assignment_outlined",
        title: "Ver Información Plus",
        subtitle: "Datos mas detallados",
        description:
          "Accede a datos detallados del DNI, como información personal, dirección, estado civil y más, con la inclusión de imágenes del rostro y huellas digitales.",
        cost: `${cachedCreditos.dni_plus} créditos`,
        BusquedaPage: {
          titulo: "Bucar DNI Plus",
          api: `${apigeneral}/consulta-dni4`,
          
          campos: {
            dni: { label: "DNI", type: "number", maxLength: 8 },
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
      tarjeta4: {
        icon: "Icons.assignment_outlined",
        title: "Arbol Geneologico",
        subtitle: "Datos de los familiares",
        description: "Accede a datos detallados de los familiares.",
        cost: `${cachedCreditos.arbol_g} créditos`,
        BusquedaPage: {
          titulo: "Bucar Arbol Geneologico",
          api: `${apigeneral}/arbol-text`,

          campos: {
            dni: { label: "DNI", type: "number", maxLength: 8 },
          },
        },
        buildBackCard: {
          json: {
            arbol: [
              {
                APELLIDOS: "CASTILLO TERRONES",
                DNI: "43590982",
                EDAD: "40",
                GENERO: "FENEMINO",
                NOMBRES: "MARIA ELVIRA",
                TIPO: "HERMANA",
                VERIFICACION: "MEDIA",
              },
              {
                "APELLIDOS": "CASTILLO TERRONES",
                "DNI": "44222922",
                "EDAD": "37",
                "GENERO": "FENEMINO",
                "NOMBRES": "MARIA AMELIA",
                "TIPO": "HERMANA",
                "VERIFICACION": "MEDIA"
              },
        
            ],
          },
        },
      },
      tarjeta5: {
        icon: "Icons.assignment_outlined",
        title: "Arbol Geneologico Plus",
        subtitle: "Datos de los familiares",
        description: "Accede a datos detallados de los familiares con fotos.",
        cost: `${cachedCreditos.arbol_g_v} créditos`,
        BusquedaPage: {
          titulo: "Bucar Arbol Geneologico Plus",
          api: `${apigeneral}/arbol-foto`,

          campos: {
            dni: { label: "DNI", type: "number", maxLength: 8 },
          },
        },
        buildBackCard: {
          json: {
            arbol: [
              {
                APELLIDOS: "CASTILLO TERRONES",
                DNI: "43590982",
                EDAD: "40",
                GENERO: "FENEMINO",
                NOMBRES: "MARIA ELVIRA",
                TIPO: "HERMANA",
                VERIFICACION: "MEDIA",
              },
              {
                "APELLIDOS": "CASTILLO TERRONES",
                "DNI": "44222922",
                "EDAD": "37",
                "GENERO": "FENEMINO",
                "NOMBRES": "MARIA AMELIA",
                "TIPO": "HERMANA",
                "VERIFICACION": "MEDIA"
              },
        
            ],
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
