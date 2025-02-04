const axios = require("axios");
const { apigeneral } = require("./dataapp");
const {
  getCreditosFromCache,
  checkEmailExists,
} = require("../DB/consultas-BD");

const apiUrl = apigeneral + "/";
// Función para consultar DNI en la API (soporte GET y POST)
const consultarAPI = async (dni, apiUrl, method = "POST") => {
  console.log("Datos recibidos:", dni, apiUrl, method);

  try {
    // Verificar que el DNI tenga 8 dígitos antes de hacer la solicitud
    // Si el método es GET, agregar el DNI a la URL
    if (method === "GET") {
      // Concatenar el dni a la URL base
      const urlConDni = `${apiUrl}${dni}`; // Aquí concatenamos el DNI directamente a la URL
      const response = await axios.get(urlConDni);

      // Verificar si la respuesta tiene los datos esperados
      return response.data || [];
    } else {
      // Para POST, enviar el DNI en el cuerpo de la solicitud
      const config = {
        method,
        url: apiUrl,
        data: { dni },
      };
      const response = await axios(config);
      return response.data.listaani || [];
    }
  } catch (error) {
    console.error(
      "Error al consultar la API aqui:",
      error.response?.data || error.message
    );
    throw new Error(error.response?.data?.message || error.message);
  }
};

const traverseAndCheckEmpty = (obj) => {
  const emptyKeys = []; // Almacena las claves que están vacías.

  const checkEmpty = (value, path) => {
    if (value === null || value === undefined || value === "") {
      emptyKeys.push(path.join("."));
    } else if (Array.isArray(value) && value.length === 0) {
      emptyKeys.push(path.join("."));
    } else if (typeof value === "object" && Object.keys(value).length === 0) {
      emptyKeys.push(path.join("."));
    }
  };

  const traverse = (obj, path = []) => {
    if (typeof obj === "object" && obj !== null) {
      for (const key in obj) {
        const value = obj[key];
        const newPath = [...path, key];
        checkEmpty(value, newPath); // Verifica si el valor actual está vacío.
        traverse(value, newPath); // Recurre para explorar niveles más profundos.
      }
    }
  };

  traverse(obj);
  return emptyKeys; // Devuelve las claves vacías.
};

// Mapeo de la respuesta
async function procesarRespuesta(listaAni, id, costo, tipo = 0) {
  const cachedCreditos = await getCreditosFromCache();

  const fields = [
    "dni",
    "nombres",
    "apellido_paterno",
    "apellido_materno",
    "genero",
    "fecha_nacimiento",
    "departamento",
    "provincia",
    "distrito",
    "grado_instruccion",
    "estado_civil",
    "estatura",
    "fecha_inscripcion",
    "fecha_emision",
    "fecha_caducidad",
    "padre",
    "madre",
    "restriccion",
    "departamento_n",
    "provincia_n",
    "distrito_n",
    "direccion_n",
    "ubigeo_reniec",
    "ubigeo_inei",
    "ubigeo_sunat",
    "codigo_postal",
    "actas_matrimonio",
    "actas_nacimiento",
    "actas_defuncion",
    "cert_nacido",
    "cert_defuncion",
    "hijos",
    "imagen",
    "imagen2",
    // telefonía
    "number",
    "operator",
    "type",
    "plan",
    "titular",
    "Titular",
    "fechActivacion",
    "fecActivacion",
    "hrActivacion",
    "nuDni",
    "isInactive",
    "tipModo",
    "numSerial",
    "error",
    "modo",
    "señalTegnologia",
    "tipoLinea",
    "Email",
    "APELLIDOS",
    "DNI",
    "EDAD",
    "GENERO",
    "NOMBRES",
    "TIPO",
    "VERIFICACION",
    "lugar_nacimiento",
    "pdf",
    "tive",
    "numero_Partida",
    "oficina",
    "año",
    "nº_Partida",
    "marca",
    "Tipo_de_Carro",
    "año_de_Fabricación",
    "combustible",
    "nº_Cilindros",
    "color",
    "nº_motor",
    "nº_serie",
    "tipo_uso",
    "categoria",
    "estado",
    "List_Propietarios",
    "direccion",
    "fecha",
    "propietario",
    "tipo",
  ];

  // Mapear las claves de respuesta a nuevas claves
  const keyMapping = {
    hrActivacion: "hora_activacion",
    fechActivacion: "fecha_Activacion",
    fecActivacion: "fecha_Activacion",
    tipoLinea: "tipo_Linea",
    señalTegnologia: "señal_Tegnologia",
    nuDni: "dni",
    DNI: "dni",
    tipModo: "estado",
    numSerial: "nº_serie",
    isInactive: "Activo",
  };

  // Función para mapear las claves
  const mapKeys = (item) => {
    const mappedItem = {};

    Object.keys(item).forEach((key) => {
      if (fields.includes(key)) {
        // Verificar primero si está en el filtro
        const newKey = keyMapping[key] || key; // Aplicar el mapeo de claves solo después
        mappedItem[newKey] = item[key];
      }
    });

    return mappedItem;
  };

  //console.error("Lo q hay", listaAni);

  if (Array.isArray(listaAni)) {
    listaAni.forEach((response, index) => {
      const emptyKeys = traverseAndCheckEmpty(response);
      console.log(`Respuesta ${index + 1} - Claves vacías:`, emptyKeys);
    });
  } else if (typeof listaAni === "object" && listaAni !== null) {
    // Si listaAni no es un array pero es un objeto, procesarlo directamente.
    const emptyKeys = traverseAndCheckEmpty(listaAni);
    console.log("Claves vacías:", emptyKeys);
  } else {
    console.error(
      "El formato de listaAni no es válido. Esperado: Array u Objeto."
    );
  }

  if (listaAni) {
    if (listaAni?.data?.error) {
      console.error("Sin datos encontrados 1.");
      return "Error";
    }

    if (listaAni?.error) {
      console.error("Sin datos encontrados 1.");
      return "Error";
    }

    if (listaAni[0]?.dni == "") {
      console.error("Sin datos encontrados 1.");
      return "Error";
    }

    if (listaAni?.data == []) {
      console.error("Sin datos encontrados 2.");
      return "Error";
    }
    if (listaAni?.data?.status == false) {
      console.error("Sin datos encontrados 3.");
      return "Error";
    }

    function checkEmptyData(data) {
      return (
        !data ||
        (Array.isArray(data) && data.length === 0) ||
        (typeof data === "object" && Object.keys(data).length === 0)
      );
    }

    // Verificar si 'datos' está vacío
    //if (checkEmptyData(listaAni?.data?.datos) && checkEmptyData(listaAni?.data?.arbol)) {
    //  console.error("Sin datos encontrados.");
    //  return "Error";
    //}
    const datos = listaAni?.data?.datos;
    if (datos) {
      if (Array.isArray(datos)) {
        if (datos.length === 0) {
          console.error("El dato es un arreglo vacío.");
          // Manejo del error para arreglos vacíos
          return "Error";
        } else {
          console.log("Los datos son un arreglo:", datos);
        }
      } else if (typeof datos === "object" && datos !== null) {
        if (Object.keys(datos).length === 0) {
          console.error("El dato es un objeto vacío.");
          return "Error";
          // Manejo del error para objetos vacíos
        } else {
          console.log("Los datos son un objeto:", datos);
        }
      }
    }
    //if (listaAni?.data?.datos.length < 1) {
    //  console.error("Sin datos encontrados 3.");
    //  return "Error";
    //} else {
    //  if (Object.keys(listaAni?.data?.datos)?.length === 0) {
    //    console.error("El dato está vacío.");
    //    // Aquí puedes mostrar un mensaje de error en la UI
    //    return "Error";
    //  }
    //}
    //console.log(listaAni);

    if (
      listaAni?.data?.numbers &&
      Array.isArray(listaAni.data.numbers) &&
      listaAni.data.numbers.length === 0
    ) {
      console.error("Sin datos encontrados 3.");
      return "Error";
    }

    try {
      if (listaAni) {
        if (listaAni?.data?.data) {
          //return mapKeys({
          //  dni: listaAni.data.datos.dni || null,
          //  titular: listaAni.data.datos.titular || null,
          //});

          const exists = await checkEmailExists(id, costo, tipo);
          let creditosRestantes = 0;

          if (!exists.success) {
            console.error(
              `Error al procesar el email "${id}": ${exists.error}`
            );
            return { creditosConsulta: "Creditos Insuficientes" };
          } else {
            creditosRestantes = exists.creditosRestantes ?? null;
          }

          return {
            ...mapKeys({
              contextura: listaAni.data.data.contextura || null,
              dni: listaAni.data.data.documento || null,
              fecha_nacimiento: listaAni.data.data.fecNacimiento || null,
              lugar_nacimiento: listaAni.data.data.lugNacimiento || null,
              nombres: listaAni.data.data.nomCompletos || null,
              nº_Partida:
                listaAni.data.data?.datosVehiculares?.dataSunarp?.numPartida ||
                null,
              clase: listaAni.data.data?.clase || null,
              año:
                listaAni.data.data?.año ||
                listaAni.data.data?.datosVehiculares?.dataSunarp?.anMode ||
                null,
              fecha_inscripcion:
                listaAni.data.data?.datosVehiculares?.dataSunarp?.fecIns ||
                null,
              marca:
                listaAni.data.data?.datosVehiculares?.dataSunarp?.marca || null,
              Tipo_de_Carro:
                listaAni.data.data?.datosVehiculares?.dataSunarp
                  ?.descTipoCarr || null,
              año_de_Fabricación:
                listaAni.data.data?.datosVehiculares?.dataSunarp?.anoFab ||
                null,
              combustible:
                listaAni.data.data?.datosVehiculares?.dataSunarp
                  ?.descTipoComb || null,
              nº_Cilindros:
                listaAni.data.data?.datosVehiculares?.dataSunarp
                  ?.numCilindros || null,
              color:
                listaAni.data.data?.color ||
                listaAni.data.data?.datosVehiculares?.dataSunarp?.color ||
                null,
              marca: listaAni.data.data?.marca || null,
              modelo: listaAni.data.data?.modelo || null,
              motor_Robado: listaAni.data.data?.motorRobado || null,
              nº_serie:
                listaAni.data.data?.numSerie ||
                listaAni.data.data?.datosVehiculares?.dataSunarp?.numSerie ||
                null,
              nº_motor:
                listaAni.data.data?.datosVehiculares?.dataSunarp?.numMotor ||
                null,
              tipo_uso:
                listaAni.data.data?.datosVehiculares?.dataSunarp?.descTipoUso ||
                null,
              categoria:
                listaAni.data.data?.datosVehiculares?.dataSunarp?.coCateg ||
                null,
              List_Propietarios:
                listaAni.data.data?.datosVehiculares?.dataSunarp?.listProp?.map(
                  (propietario) => ({
                    tipo: propietario.tipoPartic, // Cambiar 'tipoPartic' a 'tipo'
                    dni: propietario.documento, // Cambiar 'documento' a 'dni'
                    propietario: propietario.propietario,
                    direccion: propietario.direccion,
                    fecha: propietario.fechaProp,
                    //numPlaca: propietario.numPlaca || null, // Agregar un valor por defecto si 'numPlaca' es null
                  })
                ) || null,
              estado:
                listaAni.data.data?.datosVehiculares?.dataSunarp?.estado ||
                null,
              pdf: listaAni.data.data.pdf || null,
            }),
            creditos: creditosRestantes,
            apiUrl: apiUrl + "consulta-dni",
            nameButton: `Obtener C4 - ${cachedCreditos.dni_simple} Coins`,
          };
        } else if (listaAni?.data?.datos) {
          //return mapKeys({
          //  dni: listaAni.data.datos.dni || null,
          //  titular: listaAni.data.datos.titular || null,
          //});

          const exists = await checkEmailExists(id, costo, tipo);
          let creditosRestantes = 0;

          if (!exists.success) {
            console.error(
              `Error al procesar el email "${id}": ${exists.error}`
            );
            return { creditosConsulta: "Creditos Insuficientes" };
          } else {
            creditosRestantes = exists.creditosRestantes ?? null;
          }
          const pdf = listaAni.data.dataPdf || null;
          const numeroPartida = listaAni.data.datos.numPart || null;

          return {
            ...mapKeys({
              dni: listaAni.data.datos.dni || null,
              titular: listaAni.data.datos.titular || null,
              tive: listaAni.data.datos.tiv || null,
              oficina: listaAni.data.datos.oficina || null,
              numero_Partida: numeroPartida,
              pdf: pdf,
            }),
            // ...(pdf === null &&
            //   numeroPartida === null && {
            creditos: creditosRestantes,
            apiUrl: apiUrl + "consulta-dni",
            nameButton: `Obtener C4 - ${cachedCreditos.dni_simple} Coins`,

            //  }),
          };
        } else if (listaAni?.data?.numbers) {
          //return listaAni.data.numbers.map(mapKeys);
          const exists = await checkEmailExists(id, costo, tipo);
          let creditosRestantes = 0;

          if (!exists.success) {
            console.error(
              `Error al procesar el email "${id}": ${exists.error}`
            );
            return { creditosConsulta: "Creditos Insuficientes" };
          } else {
            creditosRestantes = exists.creditosRestantes ?? null;
          }

          return listaAni.data.numbers.map((item) => ({
            ...mapKeys(item),
            creditos: creditosRestantes,
            apiUrl: apiUrl + "consulta-dni",
            nameButton: `Obtener C4 - ${cachedCreditos.dni_simple} Coins`,
          }));
        } else if (listaAni?.data?.ListNum) {
          const exists = await checkEmailExists(id, costo, tipo);
          let creditosRestantes = 0;

          if (!exists.success) {
            console.error(
              `Error al procesar el email "${id}": ${exists.error}`
            );
            return { creditosConsulta: "Creditos Insuficientes" };
          } else {
            creditosRestantes = exists.creditosRestantes ?? null;
          }
          const generalData = {
            email: listaAni.data.email,
            fecha_Creacion: listaAni.data.fechaCreacion,
            fecha_Ultimo_Ingreso: listaAni.data.fechaUltimoIngreso,
            nombre: listaAni.data.nombre,
            Dni: listaAni.data.nuDni,
            status: listaAni.data.status,
          };

          const combinedArray = listaAni.data.ListNum.map((item) => {
            const listNumData = mapKeys(item); // Mapear las claves del objeto actual
            return {
              ...generalData, // Incluir los datos generales
              ...listNumData, // Incluir los datos de ListNum mapeados
              creditos: creditosRestantes,
              apiUrl: apiUrl + "consulta-dni",
              nameButton: `Obtener C4 - ${cachedCreditos.dni_simple} Coins`,
            };
          });

          return combinedArray;
        } else if (listaAni?.data?.response) {
          const exists = await checkEmailExists(id, costo, tipo);
          let creditosRestantes = 0;

          if (!exists.success) {
            console.error(
              `Error al procesar el email "${id}": ${exists.error}`
            );
            return { creditosConsulta: "Creditos Insuficientes" };
          } else {
            creditosRestantes = exists.creditosRestantes ?? null;
          }
          // Obtener solo las claves que están en fields
          const filteredData = Object.keys(listaAni.data.response).reduce(
            (result, key) => {
              if (fields.includes(key)) {
                result[key] = listaAni.data.response[key];
              }
              return result;
            },
            {}
          );

          // Agregar los campos adicionales no incluidos en fields
          const additionalFields = {
            //isCancelled: listaAni.data.response.isCancelled,
            activo: listaAni.data.response.isInactive,
            isNew: listaAni.data.response.isNew,
            nuDni: listaAni.data.response.nuDni,
            nº_serie: listaAni.data.response.numSerial,
            tipo_Plan: listaAni.data.response.tipModo,
            //tipo_Plan: listaAni.data.response.tipPlan,
          };

          return {
            ...mapKeys(filteredData),
            ...additionalFields, // Combina los campos adicionales
            creditos: creditosRestantes,
            apiUrl: apiUrl + "consulta-dni",
            nameButton: `Obtener C4 - ${cachedCreditos.dni_simple} Coins`,
          };
        } else if (listaAni?.data?.arbol) {
          const exists = await checkEmailExists(id, costo, tipo);
          let creditosRestantes = 0;

          if (!exists.success) {
            console.error(
              `Error al procesar el email "${id}": ${exists.error}`
            );
            return { creditosConsulta: "Creditos Insuficientes" };
          } else {
            creditosRestantes = exists.creditosRestantes ?? null;
          }

          console.log("Data Arbol");
          //return listaAni.data.arbol.map(mapKeys);
          return listaAni.data.arbol.map((item) => ({
            ...mapKeys(item),
            creditos: creditosRestantes,
            apiUrl: apiUrl + "consulta-dni",
            nameButton: `Obtener C4 - ${cachedCreditos.dni_simple} Coins`,
          }));
        } else {
          const exists = await checkEmailExists(id, costo, tipo);
          let creditosRestantes = 0;

          if (!exists.success) {
            console.error(
              `Error al procesar el email "${id}": ${exists.error}`
            );
            return { creditosConsulta: "Creditos Insuficientes" };
          } else {
            creditosRestantes = exists.creditosRestantes ?? null;
          }

          return listaAni.reduce((acc, item) => {
            // Validar y asignar cada campo existente
            fields.forEach((field) => {
              if (item[field]) acc[field] = item[field];
            });

            // Procesar imágenes
            if (item.imagenes && Array.isArray(item.imagenes)) {
              acc.imagenes = item.imagenes.map((img, index) => ({
                [`imagen${index + 1}`]: img,
              }));
            }
            acc.creditos = creditosRestantes;
            acc.apiUrl = apiUrl + "arbol-text";
            //acc.nameButton = "Arbol Geneologico";
            acc.nameButton = `Arbol Geneologico - ${cachedCreditos.arbol_g} Coins`;

            return acc;
          }, {});
        }
      }
    } catch (error) {
      console.log("Error en procesar", error);
    }
  } else {
    console.error("No se encontraron datos para procesar.");
    return [];
  }
}

module.exports = { consultarAPI, procesarRespuesta };
