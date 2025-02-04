const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const jwt = require("jsonwebtoken");
const cors = require("cors");

const { consultarAPI, procesarRespuesta } = require("./DB/consultas");
const { generatePdfFromData } = require("./functions/crearPDF.js");
const { API_URLS, apigeneral } = require("./DB/dataapp");
const { checkEmailExists, getCreditosFromCache } = require("./DB/consultas-BD");
const {
  consultarVendedores,
  agregarCodigo,
  eliminarCodigo,
  solicitarPago,
  modificarBilletera,
} = require("./DB/dataVendedores.js");
const app = express();
const port = process.env.PORT || 3000;

// Middleware para parsear el cuerpo de las solicitudes como JSON
app.use(bodyParser.json());
app.use(cors());

app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

const JWT_SECRET = "your_jwt_secret";

const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Invalid token" });
    }
    req.user = decoded; // Guardar información del usuario decodificada
    next();
  });
};

let cachedCreditos = {};
let pdfBase64;


app.post("/index", async (req, res) => {
  const { appKey } = req.body;

  if (appKey === "flutter_secret_key") {
    cachedCreditos = await getCreditosFromCache();

    const token = jwt.sign({ user: "flutter_user" }, JWT_SECRET, {
      expiresIn: "1h",
    });

    return res.json({ token });
  }

  return res.status(401).json({ error: "Unauthorized" });
});

//Consultas a las APIs secundarias
app.post("/consulta-dni", verifyToken, async (req, res) => {
  const { dni, id } = req.body;

  if (!dni || !id) {
    return res.json({ mensaje: 'El parámetro "dni" es obligatorio' });
  }

  if (dni.length !== 8 || !/^\d+$/.test(dni)) {
    return res.json({ mensaje: "El DNI debe de 8 dígitos." });
  }

  try {
    const listaAni = await consultarAPI(dni, API_URLS.API_URL_DNI);
    //console.log(listaAni);

    const respuesta = await procesarRespuesta(
      listaAni,
      id,
      cachedCreditos.dni_simple
    );
    //console.log(respuesta);
    res.json({ respuesta });
  } catch (error) {
    console.error("Error al consultar la API:", error.message);
    res.status(500).json({ error: "Error al consultar la API externa" });
  }
});

app.post("/consulta-dni4", verifyToken, async (req, res) => {
  const { dni, id } = req.body;

  if (!dni || !id) {
    return res.json({ mensaje: 'El parámetro "dni" es obligatorio' });
  }
  if (dni.length !== 8 || !/^\d+$/.test(dni)) {
    return res.status(400).json({ error: "El DNI debe de 8 dígitos." });
  }

  try {
    const listaAni = await consultarAPI(dni, API_URLS.API_URL_DNI_4);
    const respuesta = await procesarRespuesta(
      listaAni,
      id,
      cachedCreditos.dni_plus
    );
    res.json({ respuesta });

    //generatePdfFromData(respuesta)
    //  .then((pdfBase64Data) => {
    //    pdfBase64 = pdfBase64Data
    //    console.log("PDF generado en base64");
    //    // Puedes hacer lo que necesites con el PDF en base64
    //  })
    //  .catch((err) => {
    //    console.error("Error al generar el PDF:", err);
    //  });
  } catch (error) {
    console.error("Error al consultar la API:", error.message);
    res.status(500).json({ error: "Error al consultar la API externa" });
  }
});

app.post("/consulta-reniec", verifyToken, async (req, res) => {
  const { dni, nombre, ap_pat, ap_mat, id } = req.body;

  // Validar que los parámetros "nombre" y "ap_pat" estén presentes
  if (!nombre || !ap_pat || !id) {
    return res.json({ mensaje: 'Debe proporcionar "nombre" y "ap_pat".' });
  }

  try {
    // Crear el objeto de parámetros para la consulta
    const params = {};

    // Solo agregar el DNI si está presente
    if (dni) params.dni = dni;
    if (nombre) params.nombre = nombre;
    if (ap_pat) params.ap_pat = ap_pat;
    if (ap_mat) params.ap_mat = ap_mat; // No obligatorio, se agrega si existe

    console.log("Realizando la consulta con parámetros:", params);

    // Realizar la consulta GET a la API externa con los parámetros
    const response = await axios.get(API_URLS.API_URL_RENIEC, { params });

    // Personalizar la respuesta
    const data = response.data;
    console.log("Datos de la respuesta de la API:", data);

    // Verificar si se encontraron resultados
    if (data["Documentos encontrados"] > 0) {
      const exists = await checkEmailExists(
        id,
        cachedCreditos.buscar_dni_por_nm
      );
      console.log(`¿Existe el email "${id}"?`, exists);

      if (!exists.success) {
        console.error(`Error al procesar el email "${id}": ${exists.error}`);
        return res.json({ creditosConsulta: exists.error });
      }
      // Modificar la estructura de los resultados
      const resultadosModificados = data.Resultados.map((item) => {
        // Creamos un objeto que solo contiene los campos disponibles
        const resultado = {};

        if (item.nuDni) resultado.dni = item.nuDni;
        if (item.apePaterno) resultado.apellido_paterno = item.apeMaterno;
        if (item.apeMaterno) resultado.apellido_materno = item.preNombres;
        if (item.preNombres) resultado.nombres = item.apePaterno;
        if (item.nuEdad) resultado.edad = item.nuEdad;
        resultado.creditos = exists.creditosRestantes ?? null;
        resultado.apiUrl = `${apigeneral}/consulta-dni`;
        resultado.nameButton = "Buscar C4";
        return resultado; // Solo devolvemos los campos presentes
      });

      // Enviar la respuesta personalizada
      res.json({
        estado: "Exitoso",
        respuesta: resultadosModificados,
      });
      console.log(resultadosModificados);
    } else {
      res.json({ mensaje: "No se encontraron documentos" });
    }
  } catch (error) {
    // Manejo de errores
    console.error(
      "Error al consultar la API externa:",
      error.response?.data || error.message
    );
    res.json({ mensaje: "Error al consultar la API externa" });
  }
});

app.post("/telefono-simple", verifyToken, async (req, res) => {
  const { dni, id } = req.body;

  if (!dni || !id) {
    return res.json({ mensaje: 'El parámetro "dni" es obligatorio' });
  }

  try {
    if (dni.length == 8) {
      console.log("Tiene 8 digitos", dni);

      const listaAni = await consultarAPI(
        dni,
        API_URLS.API_URLS_PHONE.TELEFON_DNI,
        "GET"
      );
      const respuesta = await procesarRespuesta(
        listaAni,
        id,
        cachedCreditos.tel,
        1
      );
      //console.log("Respuesta", respuesta);

      res.json({ respuesta });
    } else if (dni.length == 9) {
      console.log("Tiene 9 digitos", dni);
      const listaAni = await consultarAPI(
        dni,
        API_URLS.API_URLS_PHONE.TELEFON_NUM,
        "GET"
      );
      const respuesta = await procesarRespuesta(
        listaAni,
        id,
        cachedCreditos.tel,
        1
      );
      //console.log("Respuesta", respuesta);

      res.json({ respuesta });
    } else {
      res.json({ mensaje: "El DNI debe de 8 dígitos." });
    }
  } catch (error) {
    console.error(
      "Error al consultar la API:",
      error.response?.data || error.message
    );

    res.status(500).json({ error: "Error al consultar la API externa" });
  }
});

function eliminarClaves(objeto, clavesAEliminar) {
  if (Array.isArray(objeto)) {
    return objeto.map((item) => eliminarClaves(item, clavesAEliminar));
  } else if (typeof objeto === "object" && objeto !== null) {
    return Object.fromEntries(
      Object.entries(objeto)
        .filter(([key]) => !clavesAEliminar.includes(key)) // Filtrar claves a eliminar
        .map(([key, value]) => [key, eliminarClaves(value, clavesAEliminar)]) // Aplicar recursivamente
    );
  }
  return objeto; // Si no es un objeto ni un array, devolver tal cual
}

function convertToSnakeCase(obj) {
  const result = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      // Convertir la clave a snake_case
      const snakeKey = key.replace(
        /[A-Z]/g,
        (letter) => `_${letter.toLowerCase()}`
      );

      // Si el valor es un objeto o un array, hacer la conversión recursiva
      if (typeof obj[key] === "object" && obj[key] !== null) {
        result[snakeKey] = convertToSnakeCase(obj[key]);
      } else {
        result[snakeKey] = obj[key];
      }
    }
  }
  return result;
}

app.post("/seeker", verifyToken, async (req, res) => {
  const { dni, id } = req.body;

  if (!dni || !id) {
    return res.json({ mensaje: 'El parámetro "dni" es obligatorio' });
  }

  try {
    if (dni.length == 8) {
      console.log("Tiene 8 digitos", dni);

      const listaAni = await consultarAPI(dni, API_URLS.API_SEEKER, "GET");
      const { Status, Dev, ...filteredResponse } = listaAni.data.SeekerData;
      // Claves que deseas eliminar
      const clavesAEliminar = ["Status", "Dev", "Estado"];

      // Llamar a la función
      const transformedData = eliminarClaves(filteredResponse, clavesAEliminar);

      const exists = await checkEmailExists(id, cachedCreditos.seeker);
      if (!exists.success) {
        console.error(`Error al procesar el email "${id}": ${exists.error}`);
        return res.json({ creditosConsulta: exists.error });
      }
      const SeekerData = {
        datos_Persona: {
          nombre_completo: transformedData.datosPersona.data.nombreCompleto,
          dni: transformedData.datosPersona.data.nuDni, // Cambio de 'nuDni' a 'dni'
          fecha_nacimiento: transformedData.datosPersona.data.fechaNacimiento,
          edad: transformedData.datosPersona.data.edad,
          sexo: transformedData.datosPersona.data.sexo,
          estado_civil: transformedData.datosPersona.data.estadoCivil,
          padre: transformedData.datosPersona.data.padre,
          madre: transformedData.datosPersona.data.madre,
          ubicacion: transformedData.datosPersona.data.ubicacion,
          direccion: transformedData.datosPersona.data.direccion,
          ubigeo_nacimiento: transformedData.datosPersona.data.ubigeoNacimiento,
        },
        Telefonos: {
          data: transformedData.Telefonos.data,
        },
        Correos: { data: transformedData.Correos.data },
        Trabajos: { data: transformedData.Trabajos.data },
        SBS: {
          data: transformedData.SBS.reporteSbs.data,
        },
        creditos: exists.creditosRestantes ?? null,
      };

      // const respuesta = await procesarRespuesta(resultado, id);
      console.log("Respuesta", SeekerData, exists);

      res.json({ SeekerData });
    } else {
      res.json({ mensaje: "Ingrese un DNI de 8 digitos" });
    }
  } catch (error) {
    console.error(
      "Error al consultar la API:",
      error.response?.data || error.message
    );
    return res.json({ mensaje: "No hay Datos." });

    //res.status(500).json({ error: "Error al consultar la API externa" });
  }
});

app.post("/seeker-telefono", verifyToken, async (req, res) => {
  const { dni, id } = req.body;

  if (!dni || !id) {
    return res.json({ mensaje: 'El parámetro "dni" es obligatorio' });
  }

  try {
    if (dni.length == 9) {
      console.log("Tiene 8 digitos", dni);

      const listaAni = await consultarAPI(dni, API_URLS.API_SEEKER_TEL, "GET");
      const { Status, Dev, ...filteredResponse } = listaAni.data.SeekerData;
      // Claves que deseas eliminar
      const clavesAEliminar = ["Status", "Dev", "Estado"];

      // Llamar a la función
      const transformedData = eliminarClaves(filteredResponse, clavesAEliminar);
      const exists = await checkEmailExists(id, cachedCreditos.seeker);
      if (!exists.success) {
        console.error(`Error al procesar el email "${id}": ${exists.error}`);
        return res.json({ creditosConsulta: exists.error });
      }
      const SeekerData = {
        datos_Persona: {
          nombre_completo: transformedData.datosPersona.data.nombreCompleto,
          dni: transformedData.datosPersona.data.nuDni, // Cambio de 'nuDni' a 'dni'
          fecha_nacimiento: transformedData.datosPersona.data.fechaNacimiento,
          edad: transformedData.datosPersona.data.edad,
          sexo: transformedData.datosPersona.data.sexo,
          estado_civil: transformedData.datosPersona.data.estadoCivil,
          padre: transformedData.datosPersona.data.padre,
          madre: transformedData.datosPersona.data.madre,
          ubicacion: transformedData.datosPersona.data.ubicacion,
          direccion: transformedData.datosPersona.data.direccion,
          ubigeo_nacimiento: transformedData.datosPersona.data.ubigeoNacimiento,
        },
        Telefonos: {
          data: transformedData.Telefonos.data,
        },
        Correos: { data: transformedData.Correos.data },
        Trabajos: { data: transformedData.Trabajos.data },
        SBS: {
          data: transformedData.SBS.reporteSbs.data,
        },
        creditos: exists.creditosRestantes ?? null,
      };

      // const respuesta = await procesarRespuesta(resultado, id);
      console.log("Respuesta", SeekerData, exists);

      res.json({ SeekerData });
    } else {
      res.json({ mensaje: "Ingrese un DNI de 8 digitos" });
    }
  } catch (error) {
    console.error(
      "Error al consultar la API:",
      error.response?.data || error.message
    );
    return res.json({ mensaje: "No hay Datos." });

    // res.status(500).json({ error: "Error al consultar la API externa" });
  }
});

app.post("/movistar", verifyToken, async (req, res) => {
  const { dni, id } = req.body;

  if (!dni || !id) {
    return res.json({ mensaje: 'El parámetro "dni" es obligatorio' });
  }

  try {
    if (dni.length == 8) {
      console.log("Tiene 8 digitos", dni);

      const listaAni = await consultarAPI(
        dni,
        API_URLS.API_URLS_PHONE.MOVISTAR_DNI,
        "GET"
      );
      const respuesta = await procesarRespuesta(
        listaAni,
        id,
        cachedCreditos.tel_tiemp_real,
        1
      );
      console.log("Respuesta", listaAni);

      res.json({ respuesta });
    } else if (dni.length == 9) {
      console.log("Tiene 9 digitos", dni);
      const listaAni = await consultarAPI(
        dni,
        API_URLS.API_URLS_PHONE.MOVISTAR_NUM,
        "GET"
      );
      const respuesta = await procesarRespuesta(
        listaAni,
        id,
        cachedCreditos.tel_tiemp_real,
        1
      );
      res.json({ respuesta });
    }
  } catch (error) {
    console.error(
      "Error al consultar la API:",
      error.response?.data || error.message
    );

    res.status(500).json({ error: "Error al consultar la API externa" });
  }
});

app.post("/bitel", verifyToken, async (req, res) => {
  const { dni, id } = req.body;

  if (!dni || !id) {
    return res.json({ mensaje: 'El parámetro "dni" es obligatorio' });
  }

  try {
    if (dni.length == 9) {
      console.log("Tiene 8 digitos", dni);

      const listaAni = await consultarAPI(
        dni,
        API_URLS.API_URLS_PHONE.BITEL_NUM,
        "GET"
      );
      const respuesta = await procesarRespuesta(
        listaAni,
        id,
        cachedCreditos.tel_tiemp_real,
        1
      );
      //console.log("Respuesta", respuesta);

      res.json({ respuesta });
    } else {
      res.json({ mensaje: "Ingrese un numero telefónico de 9 digitos" });
    }
  } catch (error) {
    console.error(
      "Error al consultar la API:",
      error.response?.data || error.message
    );

    res.status(500).json({ error: "Error al consultar la API externa" });
  }
});

app.post("/claro", verifyToken, async (req, res) => {
  const { dni, id } = req.body;

  if (!dni || !id) {
    return res.json({ mensaje: 'El parámetro "dni" es obligatorio' });
  }

  try {
    if (dni.length == 8) {
      console.log("Tiene 8 digitos", dni);

      const listaAni = await consultarAPI(
        dni,
        API_URLS.API_URLS_PHONE.CLARO_DNI,
        "GET"
      );
      const respuesta = await procesarRespuesta(
        listaAni,
        id,
        cachedCreditos.tel_tiemp_real,
        1
      );
      //console.log("Respuesta", respuesta);

      res.json({ respuesta });
    } else {
      res.json({ mensaje: "Ingrese un numero DNI de 8 digitos" });
    }
  } catch (error) {
    console.error(
      "Error al consultar la API:",
      error.response?.data || error.message
    );

    res.status(500).json({ error: "Error al consultar la API externa" });
  }
});

app.post("/arbol-text", verifyToken, async (req, res) => {
  const { dni, id } = req.body;

  if (!dni || !id) {
    return res.json({ mensaje: 'El parámetro "dni" es obligatorio' });
  }

  try {
    if (dni.length == 8) {
      console.log("Tiene 8 digitos", dni);

      const listaAni = await consultarAPI(dni, API_URLS.API_ARBOL_TEXT, "GET");
      const respuesta = await procesarRespuesta(
        listaAni,
        id,
        cachedCreditos.arbol_g
      );
      console.log("Respuesta", respuesta);

      res.json({ respuesta });
    } else {
      res.json({ mensaje: "Ingrese un DNI de 8 digitos" });
    }
  } catch (error) {
    console.error(
      "Error al consultar la API:",
      error.response?.data || error.message
    );

    res.status(500).json({ error: "Error al consultar la API externa" });
  }
});

app.post("/arbol-foto", verifyToken, async (req, res) => {
  const { dni, id } = req.body;

  if (!dni || !id) {
    return res.json({ mensaje: 'El parámetro "dni" es obligatorio' });
  }

  try {
    if (dni.length == 8) {
      console.log("Tiene 8 digitos", dni);
      const listaAni = await consultarAPI(dni, API_URLS.API_ARBOL_TEXT, "GET");
      const respuestaN = await procesarRespuesta(
        listaAni,
        id,
        cachedCreditos.arbol_g_v
      );

      // console.log("Respuesta original", respuesta);

      // Iterar sobre cada DNI y realizar la consulta para obtener la imagen
      const respuesta = [];
      for (const persona of respuestaN) {
        try {
          // Realiza la consulta a la API para el DNI de la persona actual
          const foto = await consultarAPI(persona.dni, API_URLS.API_URL_DNI);
          const fotor_respuesta = procesarRespuesta(foto);

          // Agregar los datos procesados al resultado
          respuesta.push({
            ...persona, // Incluye todos los datos originales
            imagen: fotor_respuesta?.imagen || null,
          });
        } catch (error) {
          // Manejo de errores en la consulta
          console.error(
            `Error consultando API para el DNI ${persona.dni}:`,
            error
          );
          respuesta.push({
            ...persona, // Incluye todos los datos originales
            imagen: null, // No se pudo obtener la imagen
            error: "Error en la consulta a la API", // Mensaje de error
          });
        }
      }

      console.log("Respuesta con imagenes:", respuesta);

      res.json({ respuesta });
    } else {
      res.json({ mensaje: "Ingrese un DNI de 8 digitos" });
    }
  } catch (error) {
    console.error(
      "Error al consultar la API:",
      error.response?.data || error.message
    );

    res.status(500).json({ error: "Error al consultar la API externa" });
  }
});

app.post("/rq", verifyToken, async (req, res) => {
  const { dni, id } = req.body;

  if (!dni || !id) {
    return res.json({ mensaje: 'El parámetro "dni" es obligatorio' });
  }

  try {
    if (dni.length == 8) {
      console.log("Tiene 8 digitos", dni);
      const listaAni = await consultarAPI(dni, API_URLS.API_RQ, "GET");
      const respuesta = await procesarRespuesta(
        listaAni,
        id,
        cachedCreditos.rq,
        2
      );
      console.log("Respuesta:", respuesta);

      res.json({ respuesta });
    } else {
      res.json({ mensaje: "Ingrese un DNI de 8 digitos" });
    }
  } catch (error) {
    console.error(
      "Error al consultar la API:",
      error.response?.data || error.message
    );

    res.status(500).json({ error: "Error al consultar la API externa" });
  }
});

app.post("/antece", verifyToken, async (req, res) => {
  const { dni, id } = req.body;

  if (!dni || !id) {
    return res.json({ mensaje: 'El parámetro "dni" es obligatorio' });
  }

  try {
    if (dni.length == 8) {
      console.log("Tiene 8 digitos", dni);
      const listaAni = await consultarAPI(dni, API_URLS.API_ANTECE, "GET");
      const respuesta = await procesarRespuesta(
        listaAni,
        id,
        cachedCreditos.antecedentes_sinpol,
        2
      );
      console.log("Respuesta:", respuesta);

      res.json({ respuesta });
    } else {
      res.json({ mensaje: "Ingrese un DNI de 8 digitos" });
    }
  } catch (error) {
    console.error(
      "Error al consultar la API:",
      error.response?.data || error.message
    );

    res.status(500).json({ error: "Error al consultar la API externa" });
  }
});

app.post("/tive", verifyToken, async (req, res) => {
  const { dni, id } = req.body;

  if (!dni || !id) {
    return res.json({ mensaje: 'El parámetro "dni" es obligatorio' });
  }

  try {
    const listaAni = await consultarAPI(dni, API_URLS.API_TIVE, "GET");
    const respuesta = await procesarRespuesta(
      listaAni,
      id,
      cachedCreditos.tive
    );
    console.log("Respuesta:", respuesta);

    res.json({ respuesta });
  } catch (error) {
    console.error(
      "Error al consultar la API:",
      error.response?.data || error.message
    );

    res.status(500).json({ error: "Error al consultar la API externa" });
  }
});

app.post("/placa-simple", verifyToken, async (req, res) => {
  const { dni, id } = req.body;

  if (!dni || !id) {
    return res.json({ mensaje: 'El parámetro "dni" es obligatorio' });
  }

  try {
    const listaAni = await consultarAPI(dni, API_URLS.API_PLACA, "GET");
    const respuesta = await procesarRespuesta(
      listaAni,
      id,
      cachedCreditos.buscar_placa
    );
    console.log("Respuesta:", respuesta);

    res.json({ respuesta });
  } catch (error) {
    console.error(
      "Error al consultar la API:",
      error.response?.data || error.message
    );

    res.status(500).json({ error: "Error al consultar la API externa" });
  }
});

app.post("/rq-placa", verifyToken, async (req, res) => {
  const { dni, id } = req.body;

  if (!dni || !id) {
    return res.json({ mensaje: 'El parámetro "dni" es obligatorio' });
  }

  try {
    const listaAni = await consultarAPI(dni, API_URLS.API_RQ_PLACA, "GET");
    const respuesta = await procesarRespuesta(
      listaAni,
      id,
      cachedCreditos.rq_vehiculos,
      2
    );
    console.log("Respuesta:", respuesta);

    res.json({ respuesta });
  } catch (error) {
    console.error(
      "Error al consultar la API:",
      error.response?.data || error.message
    );

    res.status(500).json({ error: "Error al consultar la API externa" });
  }
});

app.post("/financiero", verifyToken, async (req, res) => {
  const { dni, id } = req.body;

  if (!dni || !id) {
    return res.json({ mensaje: 'El parámetro "dni" es obligatorio' });
  }

  try {
    if (dni.length == 8) {
      console.log("Tiene 8 digitos", dni);

      const listaAni = await consultarAPI(dni, API_URLS.API_FINANZAS, "GET");
      const respuesta = await procesarRespuesta(
        listaAni,
        id,
        cachedCreditos.sbs
      );
      console.log("Respuesta", respuesta);

      res.json({ respuesta });
    } else {
      res.json({ mensaje: "Ingrese un DNI de 8 digitos" });
    }
  } catch (error) {
    console.error(
      "Error al consultar la API:",
      error.response?.data || error.message
    );

    res.status(500).json({ error: "Error al consultar la API externa" });
  }
});

//Rutas al App
app.post("/get-tarjetas", verifyToken, async (req, res) => {
  const { tipo } = req.body; // Obtenemos el tipo de tarjeta desde el cuerpo de la solicitud

  if (!tipo) {
    return res.status(400).send("El tipo de tarjeta es obligatorio.");
  }

  try {
    // Usamos require dinámico para cargar el módulo correspondiente
    const { obtenerTarjetas } = require(`./functions/${tipo}`);

    // Obtenemos las tarjetas usando la función dinámica
    const tarjetas = await obtenerTarjetas();

    // Respondemos con las tarjetas completas
    res.json(tarjetas);
  } catch (error) {
    console.error("Error al obtener las tarjetas:", error.message);
    res.status(500).send("Error al obtener las tarjetas.");
  }
});

app.post("/vendedores", verifyToken, async (req, res) => {
  const { email } = req.body; // Obtenemos el tipo de tarjeta desde el cuerpo de la solicitud

  if (!email) {
    return res.json({ mensaje: 'El parámetro "email" es obligatorio' });
  }

  try {
    const clientes = await consultarVendedores(email);

    // Respondemos con las tarjetas completas
    console.log(clientes);
    res.json(clientes);
  } catch (error) {
    console.error("Error al obtener las tarjetas:", error.message);
    res.status(500).send("Error al obtener las tarjetas.");
  }
});

app.post("/codigoV", verifyToken, async (req, res) => {
  const { email } = req.body; // Obtenemos el tipo de tarjeta desde el cuerpo de la solicitud

  if (!email) {
    return res.json({ mensaje: 'El parámetro "email" es obligatorio' });
  }

  try {
    const codigoGenerado = await agregarCodigo(email);

    // Respondemos con las tarjetas completas
    console.log(codigoGenerado);
    res.json(codigoGenerado);
  } catch (error) {
    console.error("Error al obtener el codigo:", error.message);
  }
});

app.post("/verificar-code", verifyToken, async (req, res) => {
  var { code, eliminar, email } = req.body; // Obtenemos el tipo de tarjeta desde el cuerpo de la solicitud

  if (!code) {
    return res.json({ mensaje: 'El parámetro "email" es obligatorio' });
  }

  try {
    const eliminado = await eliminarCodigo(code, eliminar, email);
    // Respondemos con las tarjetas completas
    console.log(eliminado);
    res.json(eliminado);
  } catch (error) {
    console.error("Error al obtener el codigo:", error.message);
  }
});

app.post("/solicitar-pago", verifyToken, async (req, res) => {
  var { email, monto } = req.body; // Obtenemos el tipo de tarjeta desde el cuerpo de la solicitud

  if (!email) {
    return res.json({ mensaje: 'El parámetro "email" es obligatorio' });
  }

  try {
    const eliminado = await solicitarPago(email, monto);
    // Respondemos con las tarjetas completas
    console.log(eliminado);
    res.json(eliminado);
  } catch (error) {
    console.error("Error al obtener el codigo:", error.message);
  }
});

app.post("/billetera", verifyToken, async (req, res) => {
  var { email, telefono } = req.body; // Obtenemos el tipo de tarjeta desde el cuerpo de la solicitud

  if (!email || !telefono) {
    return res.json({ mensaje: 'El "telefono" es obligatorio' });
  }

  try {
    const eliminado = await modificarBilletera(email, telefono);
    // Respondemos con las tarjetas completas
    console.log(eliminado);
    res.json(eliminado);
  } catch (error) {
    console.error("Error al obtener el codigo:", error.message);
  }
});
// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
