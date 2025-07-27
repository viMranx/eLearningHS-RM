require('dotenv').config()
const Client = require('ssh2-sftp-client');
const formidable = require('formidable');
const mySqlQuery = require('./dbConfig');
const form = formidable({ multiples: true });

// SSH-Verbindungsdaten
let config = {
    host: process.env.DB_SSH_HOST,
    port: 22,
    username: process.env.DB_SSH_USER,
    privateKey: require('fs').readFileSync('./ssh-key/id_rsa')
};


exports.dateiUpload = function (req, callback) {
    let client = new Client();
    let lokaleDatei = "";
    let serverDatei = '';
    
    // Datei und Daten aus Form holen und prüfen
    form.parse(req, (err, fields, file) => {

        qry = 'SELECT MaterialName, m.TypID FROM Material m WHERE TypID = ' +
            '(SELECT TypID FROM MaterialTyp mt ' + 
            ' WHERE m.TypID = mt.TypID AND mt.TypName = "' + fields.dateityp + '")';
        mySqlQuery(qry, (results) => {

            if (err) {
                return callback(err);
            } 
            // Dateiupload nur bei Dateien, beim Rest nur Insert
            if (fields.dateityp == "Video" || fields.dateityp == "Img" || fields.dateityp == "PDF") {
                if (!file) {
                return callback('Keine Datei gefunden');
                } 
                lokaleDatei = file.filetoupload.filepath;

                let dateiName = file.filetoupload.originalFilename;
                let org = file.filetoupload.originalFilename;
                // Prüfen ob Dateiname passsende Endung hat
                if (fields.name.length > 0) {
                    dateiName = fields.name;
                    if (dateiName.indexOf('.') <= 0) {
                        dateiName = dateiName + org.substring(org.lastIndexOf('.'));
                    }
                }
                // Prüfen, ob Dateiname bereits vorhanden
                for (let i = 0; i < results.length; i++) {
                    mn = results[i].MaterialName;

                    // Dateiname ist bereits vorhanden
                    if (mn == dateiName) {
                        last = mn.lastIndexOf('_');
                        curNum = parseInt(mn.substring(last+1, mn.lastIndexOf('.')));
                        dnOhneTyp = dateiName.substring(0, dateiName.lastIndexOf('_'));
                        dt = dateiName.substring(dateiName.lastIndexOf('.'));

                        if (last == -1) { // Erst einmal vorhanden --> _1 anfügen
                            dnOhneTyp = dateiName.substring(0, dateiName.lastIndexOf('.'));
                            dateiName = dnOhneTyp + '_1' + dt;
                            i = 0;
                        } else { // Wert um eins erhöhen
                            dnOhneTyp = dateiName.substring(0, dateiName.lastIndexOf('_'));
                            dateiName = dnOhneTyp + '_' + (curNum+1).toString() + dt;
                            i = 0;
                        }
                    }
                }

                let dateityp = file.filetoupload.mimetype;
                if (dateityp.startsWith('image/png') && fields.dateityp == "Img") {
                    serverDatei = './material/imgs/' + dateiName;
                } else if (dateityp.startsWith('video/') && fields.dateityp == "Video") {
                    serverDatei = './material/videos/' + dateiName;
                } else if (dateityp.startsWith('application/pdf') && fields.dateityp == "PDF") {
                    serverDatei = './material/pdfs/' + dateiName;
                } else {
                    return callback('Dateityp oder Kombination nicht erlaubt');
                }
                // Datei hochladen g
                qry = 'INSERT INTO Material (MaterialName, Link, ErstelltVon, TypID) VALUES ' + 
                ' ("' + dateiName + '", "' + serverDatei + '", ' + user.id + ', ' + 
                ' (SELECT TypID FROM MaterialTyp WHERE TypName = "' + fields.dateityp + '"))';
                console.log(qry);
            } else { // Dateityp ist nicht Video, Img oder PDF
                qry = 'INSERT INTO Material (MaterialName, Link, ErstelltVon, TypID) VALUES ' +
                ' ("' + fields.name + '", "' + fields.filetoupload + '", '+ user.id + ', ' +
                ' (SELECT TypID FROM MaterialTyp WHERE TypName = "' + fields.dateityp + '"))';
            }

            mySqlQuery(qry, (results) => {
                // Dateiupload nur bei Dateien, beim Rest nur Insert
                if (fields.dateityp == "Video" || fields.dateityp == "Img" || fields.dateityp == "PDF") {
                    client.connect(config)
                        .then(() => client.put(lokaleDatei, serverDatei))
                        .then((data) => {return callback(data)}) // Erfolgsmeldung zurückgeben
                        .finally(() => client.end())
                        .catch(err => {console.error(err);});
                }
            });
        });
    });
}


exports.dateiDownload = function (dt, dn, callback) {  
    console.log(dt, dn);
    let client = new Client();
    let serverDateipfad = './material/' + dt + '/' + dn;
    let lokalerDateipfad = './public/assets/' + dt + '/' + dn;
    
    // Datei herunterladen
    client.connect(config)
        .then(() => client.fastGet(serverDateipfad, lokalerDateipfad))
        .then((data) => {return callback(lokalerDateipfad)}) // Erfolgsmeldung zurückgeben
        .finally(() => client.end())
        .catch(err => {console.error(err);});
}