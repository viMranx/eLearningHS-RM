const express = require('express')
const fs = require('fs')
const bodyParser = require('body-parser');
const formidable = require('formidable')
const mySqlQuery = require('./dbConfig');
const dateiDownload = require('./fileConfig').dateiDownload;
const app = express()
const form = formidable({multiples: true});
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
    console.log("createpdf.... "+fs.existsSync(lPngPfade[i]))
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




exports.editPDF= function (req){
  form.parse(req,  (err, fields, files) => {
    let pngPfade = [];
    if(!(fields.checkbox=='on')){
      let pngs = fields.materialnames;
      if (Array.isArray(pngs)) {
        for (let i = 0; i < pngs.length; i++) {
          // pngPfade.push("./public/assets/imgs/"+pngs[i])
          dateiDownload('imgs', pngs[i], (data) => {
            console.log("Downloading "+pngs[i]+" finished? :"+fs.existsSync(data))
          }); 
          pngPfade.push("./public/assets/imgs/"+pngs[i])
        }
      } else {
        // pngPfade.push("./public/assets/imgs/"+pngs[0])
        dateiDownload('imgs', pngs[0], (data) => {
          console.log("Downloading "+pngs[i]+" finished? :"+fs.existsSync(data))
        });  
        pngPfade.push("./public/assets/imgs/"+pngs[0])
      }
      console.log("off pfade: ..."+pngPfade)
    } else {
      let pngs = files.pdferstellung;
      if (Array.isArray(pngs)) {
        for (let i = 0; i < pngs.length; i++) {
          pngPfade.push(pngs[i].filepath);
        }
      } else { 
        pngPfade.push(pngs.filepath); 
      } 
    }
    console.log("Pdf creating... ", pngPfade)
    
    console.log("Pdf created now getting to upload");
    let lokaleDatei = './test1234.pdf';
    let dateiName = "" + fields.dataname + ".pdf";
    let serverDatei = './material/pdfs/' + dateiName;
    console.log("filepath:" + lokaleDatei + " Serverpathname:" + serverDatei);
    setTimeout(() => {
      createPDF(pngPfade)
      let client = new Client();
    client.connect(config)
      .then(() => client.put(lokaleDatei, serverDatei))
      .then((data) => { return callback(data) }) // Erfolgsmeldung zurückgeben **Fehlermeldung aber geht trotzdem**
      .finally(() => client.end())
      .catch(err => { console.error(err); });
    console.log("Finished upload");
    qry2 = `INSERT INTO Material ( MaterialName, Link, ErstelltVon, TypID)
            VALUES ( "${dateiName}", "${serverDatei}", "${req.session.userId}", "${1}")`;
    mySqlQuery(qry2, (results) => {
      console.log("Material Erfolgreich Auf DB hinzugefügt und Server Uploaded");
    })
    }, 1000);
    
    
  });
} 
    