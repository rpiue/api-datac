const { dbApp } = require("./firebase-data");
const {
  doc,
  getDoc,
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} = require("firebase/firestore/lite");

let cachedCreditos = {}; // Almacena el mapa de créditos en memoria.
let isFree = false;
/**
 * Consulta los datos de créditos desde Firebase y actualiza la variable local.
 * Si ocurre un error o no se encuentra el documento, se utiliza un valor vacío.
 */
const fetchCreditosFromFirebase = async () => {
  try {
    const docRef = doc(dbApp, "app", "sMWrjLRfzWSmHl5YBxP8"); // Reemplaza con el ID real del documento en Firebase.
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      cachedCreditos = docSnap.data().creditos || {}; // Actualiza la caché con los datos de créditos obtenidos.
      isFree = docSnap.data().IsFree || false; // Guarda el valor booleano de IsFree (por defecto 'false' si no existe).
      console.log("Créditos actualizados desde Firebase:", cachedCreditos);
      console.log("Valor de IsFree:", isFree);
    } else {
      console.warn("Documento no encontrado en Firebase.");
      cachedCreditos = {}; // Restablece la caché en caso de documento inexistente.
      isFree = false; // Restablece el valor de IsFree en caso de documento inexistente.
    }
  } catch (error) {
    console.error("Error al obtener los créditos desde Firebase:", error);
    cachedCreditos = {}; // Restablece la caché en caso de error.
    isFree = false; // Restablece el valor de IsFree en caso de error.
  }
};

const isFreeApp = async () => {
  try {
    const docRef = doc(dbApp, "app", "sMWrjLRfzWSmHl5YBxP8"); // Reemplaza con el ID real del documento en Firebase.
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      isFree = docSnap.data().IsFree || false; // Guarda el valor booleano de IsFree (por defecto 'false' si no existe).
      console.log("Valor de IsFree:", isFree);
    } else {
      console.warn("Documento no encontrado en Firebase.");
      isFree = false; // Restablece el valor de IsFree en caso de documento inexistente.
    }
  } catch (error) {
    console.error("Error al obtener el valor de IsFree desde Firebase:", error);
    isFree = false; // Restablece el valor de IsFree en caso de error.
  }
};

/**
 * Retorna el mapa de créditos desde la caché.
 * Si la caché está vacía, se intenta cargar los datos desde Firebase.
 */
const getCreditosFromCache = async () => {
  if (Object.keys(cachedCreditos).length === 0) {
    console.log(
      "La caché está vacía. Intentando cargar los créditos desde Firebase..."
    );
    await fetchCreditosFromFirebase();
  }
  return cachedCreditos;
};

//Verificar el email
const checkEmailExists = async (email, costo, tipo = 0) => {
  try {
    if (isFree) {
      return { success: true };
    }

    const usuariosRef = collection(dbApp, "usuarios");
    const emailQuery = query(usuariosRef, where("email", "==", email));
    const querySnapshot = await getDocs(emailQuery);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0]; // Obtenemos el primer documento encontrado
      const userData = userDoc.data(); // Datos del usuario
      const creditos = userData.creditos || 0; // Obtener el saldo actual de créditos (0 si no está definido)
      const consul_free = userData.consul_free || 0; // Obtener el saldo actual de créditos (0 si no está definido)
      const planN = userData.planN || 0;
      const sinlimites = userData.sinlimites || false; // Obtener el saldo actual de créditos (0 si no está definido)
      if (sinlimites) {
        return { success: true };
      }
      if (planN > 0) {
        if (tipo == 1) {
          if (planN == 1 || planN == 2) {
            return { success: true };
          }
        }
        if (tipo == 2) {
          if (planN == 2) {
            return { success: true };
          }
        }
      }
      if (!sinlimites || initity == true) {
        if (consul_free > 0) {
          const nuevosCreditos = consul_free - 1;
          await updateDoc(userDoc.ref, { consul_free: nuevosCreditos });
          return { success: true };
        } else {
          if (creditos >= costo) {
            const nuevosCreditos = creditos - costo;
            // Actualizar los créditos en la base de datos
            await updateDoc(userDoc.ref, { creditos: nuevosCreditos });

            console.log(
              `Email encontrado: ${email}. Créditos actualizados: ${nuevosCreditos}`
            );
            return { success: true, creditosRestantes: nuevosCreditos };
          } else {
            console.log(
              `Email encontrado: ${email}, pero créditos insuficientes.`
            );
            return { success: false, error: "Créditos insuficientes" };
          }
        }
      }
    } else {
      console.log(`Email no encontrado: ${email}`);
      return { success: false, error: "Email no encontrado" };
    }
  } catch (error) {
    console.error("Error al procesar la solicitud:", error);
    return { success: false, error: "Error interno del servidor" };
  }
};

module.exports = {
  fetchCreditosFromFirebase,
  isFreeApp,
  getCreditosFromCache,
  cachedCreditos,
  checkEmailExists,
};
