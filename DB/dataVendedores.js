const { dbVendedores } = require("./firebase-data");
const { collection, query, where, getDocs, doc, updateDoc, arrayUnion, arrayRemove } = require("firebase/firestore/lite");

// Verificar el email y devolver los datos de los documentos encontrados
const consultarVendedores = async (email) => {
  try {
    const usuariosRef = collection(dbVendedores, "vendedores");
    const emailQuery = query(usuariosRef, where("email", "==", email));
    const querySnapshot = await getDocs(emailQuery);

    if (!querySnapshot.empty) {
      // Extraer los datos de los documentos encontrados
      const resultados = querySnapshot.docs.map((doc) => ({
        id: doc.id, // Incluye el ID del documento si es necesario
        ...doc.data(),
      }));
      return resultados; // Devuelve los resultados como un array
    } else {
      return []; // Retorna un array vacío si no hay resultados
    }
  } catch (error) {
    console.error("Error al buscar el email en Firebase:", error);
    throw error; // Propaga el error para manejarlo en el controlador
  }
};

// Generar un código aleatorio de 6 dígitos
const generarCodigoAleatorio = () => {
  return Math.floor(100000 + Math.random() * 900000); // Genera un número entre 100000 y 999999
};

// Agregar un código aleatorio al campo 'codigos' de un vendedor
const agregarCodigo = async (email) => {
  try {
    const vendedores = await consultarVendedores(email);

    if (vendedores.length > 0) {
      const vendedor = vendedores[0]; // Suponiendo que el email es único, tomamos el primer resultado
      const vendedorDocRef = doc(dbVendedores, "vendedores", vendedor.id);

      const nuevoCodigo = generarCodigoAleatorio();
      // Actualiza el campo 'codigos' añadiendo el nuevo código al array
      await updateDoc(vendedorDocRef, {
        codigos: arrayUnion(`${vendedor.prefijo}-${nuevoCodigo}`),
      });

      console.log(`Código ${vendedor.prefijo}-${nuevoCodigo} agregado correctamente al vendedor con email ${email}`);
      return `${vendedor.prefijo}-${nuevoCodigo}`; // Devuelve el código generado
    } else {
      console.warn(`No se encontró ningún vendedor con el email ${email}`);
      return false; // Indica que no se encontró el vendedor
    }
  } catch (error) {
    console.error("Error al agregar el código aleatorio:", error);
    throw error; // Propaga el error para manejarlo en el controlador
  }
};


const modificarBilletera = async (email, telefono) => {
    try {
      const vendedores = await consultarVendedores(email);
  
      if (vendedores.length > 0) {
        const vendedor = vendedores[0]; // Suponiendo que el email es único, tomamos el primer resultado
        const vendedorDocRef = doc(dbVendedores, "vendedores", vendedor.id);
  
        // Actualiza el campo 'codigos' añadiendo el nuevo código al array
        await updateDoc(vendedorDocRef, {
            billetera: telefono,
        });
  
        console.log(`Se cambio correctamente el numero ${telefono}`);
        return true; // Devuelve el código generado
      } else {
        console.warn(`No se encontró ningún vendedor con el email ${email}`);
        return false; // Indica que no se encontró el vendedor
      }
    } catch (error) {
      console.error("Error al agregar el código aleatorio:", error);
      throw error; // Propaga el error para manejarlo en el controlador
    }
  };

//const eliminarCodigo = async (codigo) => {
//    try {
//      const usuariosRef = collection(dbVendedores, "vendedores");
//  
//      // Obtener todos los documentos de la colección "vendedores"
//      const querySnapshot = await getDocs(usuariosRef);
//  
//      for (const docSnap of querySnapshot.docs) {
//        const data = docSnap.data();
//  
//        // Verificar si el código existe en el campo 'codigos'
//        if (data.codigos && Array.isArray(data.codigos) && data.codigos.includes(codigo)) {
//          const vendedorDocRef = docSnap.ref;
//  
//          // Eliminar el código específico del array
//          await updateDoc(vendedorDocRef, {
//            codigos: arrayRemove(codigo),
//          });
//  
//          console.log(`Código ${codigo} eliminado del vendedor con ID: ${docSnap.id}`);
//          return true; // Código encontrado y eliminado
//        }
//      }
//  
//      console.warn(`Código ${codigo} no encontrado en ningún documento.`);
//      return false; // Código no encontrado en ningún documento
//    } catch (error) {
//      console.error("Error al eliminar el código:", error);
//      throw error; // Propaga el error para manejarlo en el controlador
//    }
//  };

const eliminarCodigo = async (
    codigo, 
    eliminar = false, 
    email = 'cliente-ejemplo@gmail.com',
) => {
    try {
      const usuariosRef = collection(dbVendedores, "vendedores");
  
      // Obtener todos los documentos de la colección "vendedores"
      const querySnapshot = await getDocs(usuariosRef);
  
      for (const docSnap of querySnapshot.docs) {
        const data = docSnap.data();
  
        // Verificar si el código existe en el campo 'codigos'
        if (data.codigos && Array.isArray(data.codigos) && data.codigos.includes(codigo)) {
          const vendedorDocRef = docSnap.ref;
  
          // Si se debe eliminar, realizar la operación
          if (eliminar) {
            // Eliminar el código específico del array
            await updateDoc(vendedorDocRef, {
              codigos: arrayRemove(codigo),
            });
  
            console.log(`Código ${codigo} eliminado del vendedor con ID: ${docSnap.id}`);
          
  
          // Agregar un nuevo cliente con número consecutivo
          const nuevosClientes = data.clientes || {}; // Obtener los clientes existentes, si hay
  
          // Encontrar el siguiente número disponible para el nuevo cliente
          const siguienteNumero = Object.keys(nuevosClientes).length + 1;
  
          // Crear un nuevo cliente con datos de ejemplo (puedes personalizar estos datos)
          nuevosClientes[siguienteNumero] = {
            creditos: "0",
            email: email,
            estado: "pendiente",
            fecha: new Date().toISOString().split('T')[0], // Fecha actual
            index: 1, // Ajustar el índice si es necesario
            plan: "Sin Plan",
            total: "1.00",
            veces: 1,
          };
  
          // Actualizar el campo de clientes en el documento
          await updateDoc(vendedorDocRef, {
            clientes: nuevosClientes,
          });
  
          console.log(`Nuevo cliente agregado con número ${siguienteNumero} al vendedor con ID: ${docSnap.id}`);
        }
          return true; // Código encontrado y cliente agregado/eliminado
        }
      }
  
      console.warn(`Código ${codigo} no encontrado en ningún documento.`);
      return false; // Código no encontrado en ningún documento
    } catch (error) {
      console.error("Error al manejar el código:", error);
      throw error; // Propaga el error para manejarlo en el controlador
    }
};
  
const solicitarPago = async (
    email, 
    monto
) => {
    try {
        const vendedores = await consultarVendedores(email);
  
      // Obtener todos los documentos de la colección "vendedores"
      if (vendedores.length > 0) {
        const vendedor = vendedores[0]; // Suponiendo que el email es único, tomamos el primer resultado
        if (parseFloat(monto) <= parseFloat(vendedor.saldo)) {

        const vendedorDocRef = doc(dbVendedores, "vendedores", vendedor.id);
  
        const nuevosClientes = vendedor.pagos || {}; // Obtener los clientes existentes, si hay
        const saldoNuevo = (parseFloat(vendedor.saldo) - parseFloat(monto)).toFixed(2);

  
        // Encontrar el siguiente número disponible para el nuevo cliente
        const siguienteNumero = Object.keys(nuevosClientes).length + 1;

        // Crear un nuevo cliente con datos de ejemplo (puedes personalizar estos datos)
        nuevosClientes[siguienteNumero] = {
          creditos: "0",
          email: email,
          estado: "pendiente",
          fecha: new Date().toISOString().split('T')[0], // Fecha actual
          index: 1, // Ajustar el índice si es necesario
          total: parseFloat(monto).toFixed(2),
          veces: 1,
        };

        // Actualizar el campo de clientes en el documento
        await updateDoc(vendedorDocRef, {
            pagos: nuevosClientes,
            saldo: saldoNuevo
        });

        console.log(`Nuevo pagos agregado`);
     
    
        return true;
    }else{
        console.log("El monto excede el saldo disponible.");

        return {error: 'El monto excede el saldo disponible.'};
    }
    } else {
        console.warn(`No se encontró ningún vendedor con el email ${email}`);
        return false; // Indica que no se encontró el vendedor
      }

  
      //console.warn(`Código ${codigo} no encontrado en ningún documento.`);
      //return false; // Código no encontrado en ningún documento
    } catch (error) {
      console.error("Error al manejar el código:", error);
      throw error; // Propaga el error para manejarlo en el controlador
    }
};



module.exports = {
  consultarVendedores,
  agregarCodigo,
  eliminarCodigo,
  solicitarPago,
  modificarBilletera,
};
