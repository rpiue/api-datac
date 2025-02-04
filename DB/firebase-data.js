const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore/lite");

const firebaseConfig = {
  apiKey: "AIzaSyB5qdBda4y9IJ-nRR73hwYAZ51mPcB-8gc",
  authDomain: "datosapp-7ec8b.firebaseapp.com",
  projectId: "datosapp-7ec8b",
  storageBucket: "datosapp-7ec8b.firebasestorage.app",
  messagingSenderId: "545928957575",
  appId: "1:545928957575:web:ee11b835319eb9ccb93222",
  measurementId: "G-9BC00N7XQC",
};

// Initialize Firebase
const appFirebase = initializeApp(firebaseConfig, "datosUsuario");
const dbApp = getFirestore(appFirebase);


const firebaseConfigVendedores = {
  apiKey: "AIzaSyB01yuJ90Bqob8Ze5NwfZWVAUjzLdtQc_k",
  authDomain: "vendedoresappdata.firebaseapp.com",
  projectId: "vendedoresappdata",
  storageBucket: "vendedoresappdata.firebasestorage.app",
  messagingSenderId: "90954252758",
  appId: "1:90954252758:web:a6498e6aa7072261fb6477",
  measurementId: "G-40ZCWBBWF8"
};

// Initialize Firebase
const vendedoresFirebase = initializeApp(firebaseConfigVendedores, "datosVendedores");
const dbVendedores = getFirestore(vendedoresFirebase);

module.exports = {
  dbApp,
  dbVendedores,
};
