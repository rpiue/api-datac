// URLs de las APIs externas
const API_URLS = {
  API_URL_DNI: "http://194.59.31.166:9782/consulta_dni",
  API_URL_DNI_4: "http://194.59.31.166:9781/consulta_dni",
  API_URL_RENIEC: "http://161.132.48.228:2336/consultaReniec",
  API_HOGAR: "http://161.132.48.228:5567/apis?tipo=hogar&dni=",
  API_ARBOL_TEXT: "http://161.132.48.228:5567/apis?tipo=arbol&dni=",
  API_RQ: "http://161.132.48.228:5567/apis?tipo=rq&dni=",
  API_RQ_PLACA: "http://161.132.48.228:5567/apis?tipo=rqpla&placa=",
  API_ANTECE: "http://161.132.48.228:5567/apis?tipo=antecedentes&dni=",
  API_TIVE: "http://161.132.48.228:5567/apis?tipo=tive&placa=",
  API_PLACA: "http://161.132.48.228:5567/apis?tipo=placa&placa=",
  API_FINANZAS: "http://161.132.56.205:3456/captura?documento=",
  API_SEEKER: "http://161.132.48.228:5567/apis?tipo=seeker&dni=",
  API_SEEKER_TEL: "http://161.132.48.228:5567/apis?tipo=telseeker&num=",
  API_URLS_PHONE: {
    TELEFON_NUM: "http://161.132.48.228:5567/apis?tipo=telefonianum&num=",
    TELEFON_DNI: "http://161.132.48.228:5567/apis?tipo=telefoniadni&dni=",
    CLARO_DNI: "http://161.132.48.228:5567/apis?tipo=cladni&dni=",
    MOVISTAR_NUM: "http://161.132.48.228:5567/apis?tipo=movcel&num=",
    MOVISTAR_DNI: "http://161.132.48.228:5567/apis?tipo=movdni&dni=",
    BITEL_NUM: "http://161.132.48.228:5567/apis?tipo=bitel&num=",
  },
};
const apigeneral = "https://codex-data.onrender.com";

module.exports = {
  API_URLS,
  apigeneral,
};
