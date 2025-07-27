const express = require('express')
const fs = require('fs')
const bodyParser = require('body-parser');
const formidable = require('formidable')
const mySqlQuery = require('./dbConfig');
const app = express()
const form = formidable({multiples: true});
const dateiDownload = require('./fileConfig').dateiDownload;

const Client = require('ssh2-sftp-client');
app.use(bodyParser.urlencoded({extended: true}));

const { PDFDocument } = require ('pdf-lib');

let config = {
  host: process.env.DB_SSH_HOST,
  port: 22,
  username: process.env.DB_SSH_USER,
  privateKey: require('fs').readFileSync('./ssh-key/id_rsa')
};

async function createPDF(lPngPfade) {

  // Wenn leer, nichts tun
  if (lPngPfade.length == 0) {
    return null;
  }
  const pdfDoc = await PDFDocument.create()

  // Alle PNGs in PDF einfügen
  for (let i = 0; i < lPngPfade.length; i++) {
    const pngImage = await pdfDoc.embedPng(fs.readFileSync(lPngPfade[i]))
    const pngDims = pngImage.scaleToFit(475, 700)
    const page = pdfDoc.addPage()
  
    page.drawImage(pngImage, {
      x: page.getWidth() / 2 - pngDims.width / 2,
      y: page.getHeight() / 2 - pngDims.height / 2,
      width: pngDims.width,
      height: pngDims.height,
    })
  }
  const pdfBytes = await pdfDoc.save()
  fs.writeFileSync('./test1234.pdf', pdfBytes) 
}



exports.rucksackPDF= function (req){

  let pngPfade = [];
  // Aus mir nicht erklärlichen Gründen ist manchmal ein Element mit dem Namen
  // 'rucksackNameRen' dabei, deshalb wird es vorher herausgefiltert
  if ('rucksackNameRen' in req.body) {
    delete req.body.rucksackNameRen;
  }
  let dateiName = req.body.name + ".pdf"; // Rucksackname als Dateiname
  delete req.body.name; // Danach hat das Objekt nur noch die Bildpfade

  if (Object.keys(req.body).length < 1) { 
    return;
  }
  for (const [key, value] of Object.entries(req.body)) {
    pngPfade.push(value);
  }
  let lokalePfade = [];
  for (let i = 0; i < pngPfade.length; i++) {
    let pngName = pngPfade[i].split("/")[pngPfade[i].split("/").length-1];
    dateiDownload('imgs', pngName, (data) => {
      console.log("Downloading "+pngName+" finished? :"+fs.existsSync(data))
    }); 
    lokalePfade.push("./public/assets/imgs/"+pngName)
  }

  setTimeout(() => {
    console.log("Pdf creating... ")
    createPDF(lokalePfade);
    console.log("Pdf created now getting to upload");
    let lokaleDatei = './test1234.pdf';
    let serverDatei = './material/pdfs/' + dateiName;
    console.log("filepath:"+lokaleDatei+" Serverpathname:"+serverDatei);
    let client = new Client();
    client.connect(config)
            .then(() => client.put(lokaleDatei, serverDatei))
            .then((data) => {return callback(data)}) // Erfolgsmeldung zurückgeben **Fehlermeldung aber geht trotzdem**
            .finally(() => client.end())
            .catch(err => {console.error(err);});
    console.log("Finished upload");
    qry2 = `INSERT INTO Material ( MaterialName, Link, ErstelltVon, TypID)
            VALUES ( "${dateiName}", "${serverDatei}", "${req.session.userId}", "${1}")`;
    mySqlQuery(qry2, (results) => {
      console.log("Material Erfolgreich Auf DB hinzugefügt und Server Uploaded");
    });
  }, 1000);
}