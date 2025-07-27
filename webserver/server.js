//// Einbidnung der Module

const express = require('express')
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

// Eigene Module
const mySqlQuery = require('./dbConfig');
const dateiDownload = require('./fileConfig').dateiDownload;
const dateiUpload = require('./fileConfig').dateiUpload;
const editPDF = require('./editPDF').editPDF;;
const rucksackPDF = require('./rucksackPDF').rucksackPDF;
//// Konstanten

const TWO_HOURS = 1000 * 60 * 60 * 2; // ms*s*min*hr
user = { id: 0, Name: '', vname: '', pwd: '', email: '', exp: 0 };

const {
  PORT = 3000,
  SESS_NAME = 'sid',
  SESS_SECRET = '7DaS.hIeR7Ist\\EIN-geHeiMnIs6',
} = process.env;

// Sorgt dafür, dass der Nutzer auf die Login-Seite weitergeleitet wird, wenn er nicht eingeloggt ist
const redirectLogin = (req, res, next) => {
  if (!req.session.userId) {
    res.redirect('/login');
  } else {
    next();
  }
}

// Leitet den Nutzer auf die Home-Seite weiter, wenn er eingeloggt ist
const redirectHome = (req, res, next) => {
  if (req.session.userId) {
    res.redirect('/home');
  } else {
    next();
  }
}

//Redirect if an Azubi
const redirectAzi = (req, res, next) => {
  if(req.session.userExp==0){
    res.redirect('/home');
  }
  else{
    next();
  }
}

const app = express()


//// Voreinstellungen

// Express - Session  ### START ### 
app.use(session({
  name: SESS_NAME,
  resave: false,  //no saving session in store
  saveUninitialized: false, // no saving uninitialized Sessions(NULL-Data) in store
  secret: SESS_SECRET,  // signature for cookie
  cookie: {
    maxAge: TWO_HOURS,
    sameSite: true, // strict same
  }
}))
// Express - Session Opts ### ENDE ###

// Dateiformat EJS statt HTML verwenden
app.set('view engine', 'ejs');

// Für Requests den Body parsen (z.B. Themen-Suche)
app.use(bodyParser.urlencoded({ extended: false }));

// Public Ordner für CSS, JS, Bilder bereitstellen
app.use('/public', express.static('public'));

// Bootstrap CSS
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));

app.use((req, res, next) => {
  res.locals.userExperte = req.session.userExp;
  return next();
});

//Globale Speicherung der userExperte Variable
app.use((req, res, next) => {
  res.locals.userExperte = req.session.userExp;
  return next();
});

//// Routing der Seiten

// Startseite bzw. Home
app.get('/', redirectLogin, (req, res) => {
  res.redirect('/home');
})

// Themen 
app.get('/themen', redirectLogin, (req, res) => {
  qry = 'SELECT * FROM Thema';
  qry_ueber = 'SELECT * FROM Thema WHERE TeilVon IS NULL';
  mySqlQuery(qry, (results) => {
    mySqlQuery(qry_ueber, (results_ueber) => {
      res.render('themen', { 
        Nachricht: 0,
        Thema: results,
        ueberThema: results_ueber
      });
    });
  });
})

app.post('/themenBearbeiten', async (req, res) => {

  //redirect-function für Uebermittlung Statusnachrichten:
  function themenRedirect(message){
    qry = 'SELECT * FROM Thema';
    qry_ueber = 'SELECT * FROM Thema WHERE TeilVon IS NULL';
    mySqlQuery(qry, (results) => {
      mySqlQuery(qry_ueber, (results_ueber) => {
        res.render('themen', { 
          Nachricht: message,
          Thema: results,
          ueberThema: results_ueber
        });
      });
    }); 
  }


  const { themaNameAdd, themaAdd, themaAddFarbe, themaName, themaReN, themaDel, ueberThemenName, ueberThemaAdd, themaDelUeber } = req.body;
  qry_UeberFarbe = `SELECT * FROM Farbe LIMIT 1;`
  qry_Azubis = `SELECT NutzerID FROM Nutzer WHERE Experte = false;`
  if(ueberThemenName, ueberThemaAdd){
    mySqlQuery(qry_UeberFarbe, (UF) => {
      if(UF.length == 0){
        themenRedirect("color_error");
      }
      else{
        qry_thema = `INSERT INTO Thema (ThemaName, Farbe) VALUES ('${ueberThemenName}', '${UF[0].FarbeHex}');`
        qry_remFarbe = `DELETE FROM Farbe WHERE Farbe.FarbeID ="${UF[0].FarbeID}";`
        mySqlQuery(qry_remFarbe, (results_remFarbe) => {
          mySqlQuery(qry_thema, (results_thema) => {
            mySqlQuery(qry_Azubis, (Azu) => {
              qry_thisThema = `SELECT ThemaID FROM Thema WHERE Farbe = "${UF[0].FarbeHex}";`
              console.log(qry_thisThema)
              mySqlQuery(qry_thisThema, (TT) => {
                if(Azu.length!=0){
                  qry_themaAddAzu = `INSERT INTO NutzerThema (NutzerID, ThemaID) VALUES (${Azu[0].NutzerID}, ${TT[0].ThemaID})`
                  if(Azu.length>1){
                    for(var i = 1; i<Azu.length; i++){
                      qry_themaAddAzu = qry_themaAddAzu + `, (${Azu[i].NutzerID}, ${TT[0].ThemaID})`
                    }
                  }
                  qry_themaAddAzu = qry_themaAddAzu + `;`
                  mySqlQuery(qry_themaAddAzu, (TAA) => {
                  })
                }
              })
            })
            themenRedirect("ueberThemaAdd");
          });
        });
      }       
    }) 
  }
  if(themaDelUeber){
    //farbe wieder in datenbank aufnehemen
    qry_farbe = `SELECT Farbe FROM Thema WHERE ThemaID ="${themaDelUeber}";`
    mySqlQuery(qry_farbe, (TF) => {             
      if(TF.length!=0){ var i=0; TF.forEach(function(data_TF){
        qry_farbeErstatten = `INSERT INTO Farbe (FarbeHex) VALUES ('${data_TF.Farbe}');`
        mySqlQuery(qry_farbeErstatten, (results_farbeErstatten) => {
        });  
      })}
    })  
    //unterthemen von Thema löschen
    qry_themenVonThema = `SELECT ThemaID FROM Thema WHERE TeilVon ="${themaDelUeber}";`
    mySqlQuery(qry_themenVonThema, (TVT) => {
      //falls es Unterthemen gibt:
      if(TVT.length!=0){
        qry_themaNutzerU = `DELETE FROM NutzerThema WHERE ThemaID IN (${TVT[0].ThemaID}`
        qry_themaInhaltU = `DELETE FROM InhaltThema WHERE ThemaID IN (${TVT[0].ThemaID}`
        qry_themaU = `DELETE FROM Thema WHERE ThemaID IN (${TVT[0].ThemaID}`
        if(TVT.length>1){
          for(var i = 1; i<TVT.length; i++){
            qry_themaNutzerU = qry_themaNutzerU + `, ${TVT[i].ThemaID}`
            qry_themaInhaltU = qry_themaInhaltU + `, ${TVT[i].ThemaID}`
            qry_themaU = qry_themaU + `, ${TVT[i].ThemaID}`
          }
        }
        qry_themaNutzerU = qry_themaNutzerU + ");"
        qry_themaInhaltU = qry_themaInhaltU + ");"
        qry_themaU = qry_themaU + ");"
        qry_themaNutzer = `DELETE FROM NutzerThema WHERE ThemaID ="${themaDelUeber}";`
        qry_themaInhalt = `DELETE FROM InhaltThema WHERE ThemaID ="${themaDelUeber}";`
        qry_thema = `DELETE FROM Thema WHERE ThemaID ="${themaDelUeber}";`

        mySqlQuery(qry_themaNutzerU, (results_themaNutzerU) => {
          mySqlQuery(qry_themaInhaltU, (results_themaInhaltU) => {   
            mySqlQuery(qry_themaU, (results_themaU) => {
              mySqlQuery(qry_themaNutzer, (results_themaNutzer) => {
                mySqlQuery(qry_themaInhalt, (results_themaInhalt) => {   
                  mySqlQuery(qry_thema, (results_thema) => {
                    themenRedirect("ueberThemaDelete_tvt");
                  });   
                });
              });
            });   
          });
        });
      }else{
        //hat keine Unterthemen
        qry_themaNutzer = `DELETE FROM NutzerThema WHERE ThemaID ="${themaDelUeber}";`
        qry_themaInhalt = `DELETE FROM InhaltThema WHERE ThemaID ="${themaDelUeber}";`
        qry_thema = `DELETE FROM Thema WHERE ThemaID ="${themaDelUeber}";`
        mySqlQuery(qry_themaNutzer, (results_themaNutzer) => {
          mySqlQuery(qry_themaInhalt, (results_themaInhalt) => {   
            mySqlQuery(qry_thema, (results_thema) => {
              themenRedirect("ueberThemaDelete_solo");
            });   
          });
        });
      }
    })
  }



  if(themaNameAdd && themaAdd){

    // function namesChecked(themenliste,tname){

      // console.log("tname: ",tname);

      // if(tname.length == 0){
      //   themenRedirect("name_leer");
      // }

      //todo: Fall: ThemaName existiert bereits (in Liste "themenliste" vorhanden), Fehlermeldung ausgeben:

      // else if(){
      // Bsp. themenRedirect("ThemaVergeben");
      // }
      // else{

      //}
      
    //}

    // qry_thema = 'SELECT Thema.ThemaName FROM Thema';
    // mySqlQuery(qry_thema, (results_themen) => {
    //   console.log("themenliste: ",results_themen);
    //   namesChecked(results_themen,themaNameAdd);
    // });

    qry_thema = `INSERT INTO Thema (ThemaName, TeilVon, Farbe)
        VALUES ('${themaNameAdd}', '${themaAdd}', '${themaAddFarbe}');`
  
    mySqlQuery(qry_thema, (results_thema) => {
      themenRedirect("themaAdd");
    });
    
  }
  
  if(themaName && themaReN){
    qry_thema = `UPDATE Thema SET ThemaName ="${themaName}" WHERE ThemaID ="${themaReN}";`
  
    mySqlQuery(qry_thema, (results_thema) => {
      themenRedirect("themaReN");
      // res.redirect('/themen');
    });
  }
  if(themaDel){
    qry_themaNutzer = `DELETE FROM NutzerThema WHERE ThemaID ="${themaDel}";`
    qry_themaInhalt = `DELETE FROM InhaltThema WHERE ThemaID ="${themaDel}";`
    qry_thema = `DELETE FROM Thema WHERE ThemaID ="${themaDel}";`;

    mySqlQuery(qry_themaNutzer, (results_themaNutzer) => {
      mySqlQuery(qry_themaInhalt, (results_themaInhalt) => {   
        mySqlQuery(qry_thema, (results_thema) => {
          // res.redirect('/themen');
          themenRedirect("themaDel");
        });   
      });
    });
  }
});

// Dateien bereitstellen / herunterladen
app.get('/material/:dateityp/:dateiname', function (req, res) {
  dateiDownload(req.params.dateityp, req.params.dateiname, (data) => {
    dateipfad = path.join(__dirname, data.substring(1));
    res.sendFile(dateipfad);
  });
});

// Startseite bzw. Home
app.get('/home', redirectLogin, (req, res) => {
  res.locals.userId = req.session.userId
  res.locals.userName = req.session.userName
  let letzteSuchen = 
    'SELECT DISTINCT ns_suche, MAX(ns_zeitstempel) ' +
    'FROM NutzerSuchen ' +
    'WHERE ns_NutzerID = ' + user.id + ' ' +
    'GROUP BY ns_suche ' +
    'ORDER BY MAX(ns_zeitstempel) DESC LIMIT 20';

  let eigeneRucks =
    'SELECT DISTINCT RucksackName, GeändertAm FROM Rucksack r ' +
    '  LEFT JOIN NutzerRucksack nr ON nr.RucksackID = r.RucksackID ' +
    'WHERE NutzerID = ' + user.id + ' OR  ErstelltVon = ' + user.id + ' ' +
    'ORDER BY GeändertAm DESC';

  mySqlQuery(letzteSuchen, (results) => {
    mySqlQuery(eigeneRucks, (results2) => {
      res.render('home', {
        NvSuchen: results,
        eigeneRucks: results2
      });
    });
  });
});

// Login-Seite
app.get('/login', redirectHome, (req, res) => {
  res.locals.err = req.session.err
  res.render('login');
});
// Empfangene Daten aus dem Login-Formular verarbeiten
app.post('/login', redirectHome, (req, res) => {
  const { email, password } = req.body;
  req.session.err = ''
  if (email && password) {//TO DO: compare with DB Users/Pwds  + verify lengths etc
    qry = `SELECT * FROM Nutzer Where Email = "${email}" AND Passwort = "${password}"`;
    mySqlQuery(qry, (results) => {
      if (!results || results.length === 0) {
        req.session.err = 'Falsche/s Email/Passwort!'
        res.redirect('/login')
        req.session.err = ''
      } else {
        user.id = results[0].NutzerID
        user.vname = results[0].Vorname
        user.Name = results[0].Nachname
        user.pwd = results[0].Passwort
        user.email = results[0].Email
        user.exp = results[0].Experte
        if (user.id && user.vname && user.pwd && user.email && user.Name) {
          req.session.userId = user.id;
          req.session.userName = user.vname;
          req.session.userExp = user.exp;
          req.session.err = ''
          res.redirect('/home');
        } else {
          req.session.err = 'Userdata wurde nicht erfolgreich gespeichert!'
          res.redirect('/login')
          req.session.err = ''
        }
      }
    });
  }

});

// Registrierung
app.get('/register', redirectHome, (req, res) => {
  
  res.render('register');
});
// Empfangene Daten aus dem Registrierungs-Formular verarbeiten
app.post('/register', redirectHome, async (req, res) => {
  const { name, email, password, vname, exp } = req.body;
  if (name && email && password && vname) { //TO DO: Post with DB Users/Pwds + verify lengths etc
    qry = `SELECT * FROM Nutzer Where Email = "${email}"`
    x = 0
    if (exp == 'on') x = 1;
    mySqlQuery(qry, (results) => {
      if (results && results.length > 0) {
        res.send("<h2>User Existiert...</h2>")

      } else {
        qry2 = `INSERT INTO Nutzer ( Nachname, Vorname, Passwort, Email, Experte)
          VALUES ( "${name}", "${vname}", "${password}", "${email}", "${x}")`;
        if (mySqlQuery(qry2, (results) => {
          console.log(results);
          // Wenn Azubi, dann alle Überthemen zuweisen
          registerId = results.insertId;
          if (!x) {
            qry3 =
            'INSERT INTO NutzerThema (NutzerID, ThemaID, ExpRate, AzuRate) ' +
            ' SELECT ' + registerId + ', ThemaID, 0, 0 FROM Thema WHERE TeilVon IS NULL';
            mySqlQuery(qry3, (results2) => {
              console.log(results2);
            });
          }
        })) {
          res.send("<h2>Registrierung Erfolgreich ...</h2>")
        }
        setTimeout(function () {
          res.redirect('/login');
        }, 2000)

      }

    });
  }
});

// Logout --> Weiterleitung auf Login-Seite
app.post('/logout', redirectLogin, (req, res) => {
  
  res.locals.userExperte = req.session.userExp;
  req.session.destroy(err => {
    if (err) {
      return res.redirect('/home');
    }
    res.clearCookie(SESS_NAME);
    res.redirect('/login');
  });
});

// Rucksack
app.get('/rucksack', redirectLogin, (req, res) => {

  rucksack_qry = 'SELECT DISTINCT Rucksack.RucksackID, Rucksack.RucksackName, Fortschritt.Fortschritt FROM Rucksack LEFT JOIN NutzerRucksack ON Rucksack.RucksackID = NutzerRucksack.RucksackID LEFT JOIN Fortschritt ON Rucksack.RucksackID = Fortschritt.RucksackID AND ' + req.session.userId + ' = Fortschritt.NutzerID WHERE Rucksack.ErstelltVon = ' + req.session.userId + ' OR NutzerRucksack.NutzerID = ' + req.session.userId;
  thema_qry = 'SELECT InhaltThema.InhaltID, Thema.ThemaName, Thema.Farbe FROM Thema INNER JOIN InhaltThema ON Thema.ThemaID=InhaltThema.ThemaID';
  inhalt_qry =
    'SELECT' +
    ' DISTINCT RucksackInhalt.RucksackID,' +
    ' Inhalt.InhaltID,' +
    '  Inhalt.InhaltName,' +
    '  Inhalt.Information,' +
    '  DATE_FORMAT(Inhalt.ErstelltAm, "%d.%c.%Y") AS ErstelltAm,' +
    '  Nutzer.Nachname,' +
    '  Material.Link,' +
    '  Inhalt.Übung,' +
    '  MaterialTyp.TypID,' +
    '  MaterialTyp.TypName, ' +
    ' (SELECT TypName FROM MaterialTyp  WHERE Material.TypID = MaterialTyp.TypID) AS TypName,' +
    ' InhaltPDF.pSeite AS pSeite, InhaltVideo.Zeitstempel, InhaltBuch.ISBN, InhaltBuch.Kapitel, InhaltBuch.bSeite AS bSeite' +
    ' FROM' +
    ' Inhalt' +
    ' LEFT JOIN Nutzer ON' +
    '  Inhalt.ErstelltVon = Nutzer.NutzerID' +
    ' INNER JOIN Material ON' +
    '  Inhalt.MaterialID = Material.MaterialID' +
    ' LEFT JOIN MaterialTyp ON' +
    '  Material.TypID = MaterialTyp.TypID ' +
    ' LEFT JOIN InhaltThema ON' +
    '  Inhalt.InhaltID = InhaltThema.InhaltID' +
    ' LEFT JOIN Thema ON' +
    '  InhaltThema.ThemaID = Thema.ThemaID' +
    ' INNER JOIN RucksackInhalt ON' +
    '  Inhalt.InhaltID = RucksackInhalt.InhaltID' +
    ' LEFT JOIN InhaltBuch ON InhaltBuch.InhaltID = Inhalt.InhaltID' +
    ' LEFT JOIN InhaltPDF ON InhaltPDF.InhaltID = Inhalt.InhaltID' +
    ' LEFT JOIN InhaltVideo ON InhaltVideo.InhaltID = Inhalt.InhaltID';
  typen_qry = 'SELECT * FROM MaterialTyp';
  mySqlQuery(rucksack_qry, (rucksack) => {
    mySqlQuery(thema_qry, (thema) => {
      mySqlQuery(inhalt_qry, (inhalt) => {
        mySqlQuery(typen_qry, (typen) => {
          res.render('rucksack', {
            Nachricht: 0,
            Rucksack: rucksack,
            Thema: thema,
            Inhalt: inhalt,
            Typen: typen
          });
        });
      });
    });
  });
})

app.get('/rucksack-edit', redirectLogin, redirectAzi, (req, res) => {
  let rucksack = req.query.rucksackEdit;
  res.locals.auswahlRucksack = req.query.rucksackEdit;

  inhalt_alle_qry = 'SELECT Inhalt.InhaltID, Inhalt.InhaltName, Material.MaterialName FROM Inhalt LEFT JOIN Material ON Inhalt.MaterialID = Material.MaterialID';
  inhalt_rucksack_qry = 'SELECT RucksackInhalt.InhaltID FROM RucksackInhalt WHERE RucksackInhalt.RucksackID = ' + rucksack;
  nutzer_alle_qry = 'SELECT Nutzer.NutzerID, Nutzer.Nachname, Nutzer.Vorname FROM Nutzer WHERE Nutzer.NutzerID != ' + req.session.userId;
  nutzer_rucksack_qry = 'SELECT NutzerRucksack.NutzerID, Fortschritt.Fortschritt FROM NutzerRucksack INNER JOIN Fortschritt ON NutzerRucksack.NutzerID = Fortschritt.NutzerID WHERE NutzerRucksack.RucksackID = ' + rucksack + '  AND Fortschritt.RucksackID = ' + rucksack + ' AND NutzerRucksack.NutzerID != ' + req.session.userId;

  mySqlQuery(inhalt_alle_qry, (inhalt_alle) => {
    mySqlQuery(inhalt_rucksack_qry, (inhalt_rucksack) => {
      mySqlQuery(nutzer_alle_qry, (nutzer_alle) => {
        mySqlQuery(nutzer_rucksack_qry, (nutzer_rucksack) => {
          res.render('rucksack-edit', {
            InhaltA: inhalt_alle,
            InhaltR: inhalt_rucksack,
            NutzerA: nutzer_alle,
            NutzerR: nutzer_rucksack
          });
        });
      });
    });
  });
})

// Rucksack Daten verarbeiten bei Nutzereingaben
app.post('/rucksack', async (req, res) => {
  
  //Funktion zum Wiederaufruf der Seite nach letzter DB-Operation
  function redirect_rucksack(input_qry,message){
    //let nachricht = "";
    
    // if(rucksackCreat == "create" && rucksackName.length == 0){nachricht = "leerer_name";}
    // else{nachricht = message;}

    mySqlQuery(input_qry, (results) => {
        input_qry = "";
        
        //hier der code von app.get('/rucksack'):
        let rucksack_qry = 'SELECT DISTINCT Rucksack.RucksackID, Rucksack.RucksackName, Fortschritt.Fortschritt FROM Rucksack LEFT JOIN NutzerRucksack ON Rucksack.RucksackID = NutzerRucksack.RucksackID LEFT JOIN Fortschritt ON Rucksack.RucksackID = Fortschritt.RucksackID AND ' + req.session.userId + ' = Fortschritt.NutzerID WHERE Rucksack.ErstelltVon = ' + req.session.userId + ' OR NutzerRucksack.NutzerID = ' + req.session.userId;
        let thema_qry = 'SELECT InhaltThema.InhaltID, Thema.ThemaName, Thema.Farbe FROM Thema INNER JOIN InhaltThema ON Thema.ThemaID=InhaltThema.ThemaID';
        let inhalt_qry =
          'SELECT' +
          ' DISTINCT RucksackInhalt.RucksackID,' +
          ' Inhalt.InhaltID,' +
          '  Inhalt.InhaltName,' +
          '  Inhalt.Information,' +
          '  DATE_FORMAT(Inhalt.ErstelltAm, "%d.%c.%Y") AS ErstelltAm,' +
          '  Nutzer.Nachname,' +
          '  Material.Link,' +
          '  Inhalt.Übung,' +
          '  MaterialTyp.TypID,' +
          '  MaterialTyp.TypName, ' +
          ' (SELECT TypName FROM MaterialTyp  WHERE Material.TypID = MaterialTyp.TypID) AS TypName,' +
          ' InhaltPDF.pSeite AS pSeite, InhaltVideo.Zeitstempel, InhaltBuch.ISBN, InhaltBuch.Kapitel, InhaltBuch.bSeite AS bSeite' +
          ' FROM' +
          ' Inhalt' +
          ' LEFT JOIN Nutzer ON' +
          '  Inhalt.ErstelltVon = Nutzer.NutzerID' +
          ' INNER JOIN Material ON' +
          '  Inhalt.MaterialID = Material.MaterialID' +
          ' LEFT JOIN MaterialTyp ON' +
          '  Material.TypID = MaterialTyp.TypID ' +
          ' LEFT JOIN InhaltThema ON' +
          '  Inhalt.InhaltID = InhaltThema.InhaltID' +
          ' LEFT JOIN Thema ON' +
          '  InhaltThema.ThemaID = Thema.ThemaID' +
          ' INNER JOIN RucksackInhalt ON' +
          '  Inhalt.InhaltID = RucksackInhalt.InhaltID' +
          ' LEFT JOIN InhaltBuch ON InhaltBuch.InhaltID = Inhalt.InhaltID' +
          ' LEFT JOIN InhaltPDF ON InhaltPDF.InhaltID = Inhalt.InhaltID' +
          ' LEFT JOIN InhaltVideo ON InhaltVideo.InhaltID = Inhalt.InhaltID';
        let typen_qry = 'SELECT * FROM MaterialTyp';
        mySqlQuery(rucksack_qry, (rucksack) => {
          mySqlQuery(thema_qry, (thema) => {
            mySqlQuery(inhalt_qry, (inhalt) => {
              mySqlQuery(typen_qry, (typen) => {
                console.log("Die message: ",message);
                res.render('rucksack', {
                  Nachricht: message,
                  Rucksack: rucksack,
                  Thema: thema,
                  Inhalt: inhalt,
                  Typen: typen
                });
              });
            });
          });
        });
        
    });
  }

  res.locals.userExperte = req.session.userExp;
  console.log("req.body: ",req.body);
  const { rucksackNameRen, rucksackReN, inhaltEntf, inhaltEntfAll, inhaltAdd, nutzerEntf, nutzerEntfAll, nutzerAdd, rucksackNr, rucksackDel, rucksackName, rucksackCreat } = req.body;
  qry = "";
  let nachricht = 0;

  if(rucksackReN && rucksackNameRen){
    qry = `UPDATE Rucksack SET RucksackName ="${rucksackNameRen}" WHERE RucksackID ="${rucksackReN}"`;
    nachricht = "umbenannt";
    redirect_rucksack(qry,nachricht);
  }

  if(rucksackCreat){

    if(rucksackCreat == "create" && rucksackName.length == 0){
      nachricht = "leerer_name";
      qry = "";
    }
    else{
      nachricht = "neuer_rucksack";
      qry = `INSERT INTO Rucksack (RucksackName, ErstelltVon)
      VALUES ('${rucksackName}', ` + req.session.userId + `)`;
    }
    console.log("MHEYN ",nachricht);
    
    redirect_rucksack(qry,nachricht);
  }
  if (inhaltEntfAll) {
    qry = `DELETE FROM RucksackInhalt 
      WHERE RucksackID="${inhaltEntfAll}"`;
    nachricht = "alle_inhalte_entfernt";
    redirect_rucksack(qry,nachricht);
  }
  if (nutzerEntfAll) {
    qry = `DELETE FROM NutzerRucksack 
      WHERE RucksackID="${nutzerEntfAll}"`;

    qry1 = `DELETE FROM Fortschritt 
      WHERE RucksackID ="${nutzerEntfAll}";`

    mySqlQuery(qry1, (results) => {
      nachricht = "alle_Nutzer_entfernt";
      qry1 = "";
      redirect_rucksack(qry,nachricht);
    });

  }
  if (rucksackNr) {
    if (inhaltEntf) {
      qry = `DELETE FROM RucksackInhalt 
        WHERE InhaltID="${inhaltEntf}" AND RucksackID="${rucksackNr}"`;
      nachricht = "inhalt_entfernt";
      redirect_rucksack(qry,nachricht);
    }
    if (inhaltAdd) {
      qry = `INSERT INTO RucksackInhalt (RucksackID, InhaltID) 
        VALUE ("${rucksackNr}", "${inhaltAdd}")`;
      nachricht = "inhalt_add";
      redirect_rucksack(qry,nachricht);
    }
    if (nutzerEntf) {
      qry = `DELETE FROM NutzerRucksack 
        WHERE NutzerID="${nutzerEntf}" AND RucksackID="${rucksackNr}"`;

      qry1 = `DELETE FROM Fortschritt 
        WHERE NutzerID="${nutzerEntf}" AND RucksackID ="${rucksackNr}"`;

      mySqlQuery(qry1, (results) => {
        nachricht = "nutzer_entfernt";
        qry1 = "";
        redirect_rucksack(qry,nachricht);
      });
    }
    if (nutzerAdd) {
      qry = `INSERT INTO NutzerRucksack (RucksackID, NutzerID) 
      VALUE ("${rucksackNr}", "${nutzerAdd}");`
      qry1 = `INSERT INTO Fortschritt (RucksackID, NutzerID) 
      VALUE ("${rucksackNr}", "${nutzerAdd}");`
      mySqlQuery(qry1, (results) => {
        nachricht = "nutzer_add";
        qry1 = "";
        redirect_rucksack(qry,nachricht);
      });
    }
  }
  
  if (rucksackDel) {
    nachricht = "entfernt";
    qry = `DELETE FROM Rucksack WHERE Rucksack.RucksackID ="${rucksackDel}";`
    qry_entfInhalt = `DELETE FROM RucksackInhalt WHERE RucksackID="${rucksackDel}";`
    qry_entfNutz = `DELETE FROM NutzerRucksack WHERE RucksackID="${rucksackDel}";`
    qry_entfFort = `DELETE FROM Fortschritt WHERE RucksackID ="${rucksackDel}";`
    mySqlQuery(qry_entfInhalt, (results) => {
      mySqlQuery(qry_entfFort, (results) => {
        mySqlQuery(qry_entfNutz, (results) => {
          redirect_rucksack(qry,nachricht);
        });
      });
    });
  }

});

app.post('/rucksackPDF', redirectLogin, redirectAzi, (req, res) => {
  rucksackPDF(req);
  res.redirect('/rucksack');
});

// Dashboard
app.get('/dashboard', redirectLogin, (req, res) => {
  let nachricht = 0;
  if (req.session.userExp == 1) {

    qry = `SELECT NutzerID, Vorname, Nachname
    FROM Nutzer
    WHERE Experte = 0`;

    mySqlQuery(qry, (results) => {
      res.render('dashboard', { Benutzertyp: 1, Nutzer: results, Tags: new Array(), ARates: new Array(), Nachricht: nachricht });
    });

  } else {
    qry = `SELECT Thema.ThemaName FROM Thema INNER JOIN NutzerThema ON Thema.ThemaID = NutzerThema.ThemaID AND NutzerThema.NutzerID = ${req.session.userId}`;
    qry2 = `SELECT NutzerThema.AzuRate, NutzerThema.ThemaID FROM NutzerThema WHERE NutzerThema.NutzerID = ${req.session.userId}`;
    qry3 = `SELECT Rucksack.RucksackID, Rucksack.RucksackName, Fortschritt.Fortschritt FROM NutzerRucksack LEFT JOIN Rucksack ON NutzerRucksack.RucksackID = Rucksack.RucksackID LEFT JOIN Fortschritt ON NutzerRucksack.RucksackID = Fortschritt.RucksackID AND NutzerRucksack.NutzerID = Fortschritt.NutzerID WHERE NutzerRucksack.NutzerID = ${req.session.userId}`;
    mySqlQuery(qry, (results) => {
      mySqlQuery(qry2, (results2) => {
        mySqlQuery(qry3, (results3) => {
          res.render('dashboard', { Benutzertyp: 0, Tags: results, Rates: results2, Rucksack: results3, Nachricht: nachricht });
        });
      });
    });
  }

})
// Dashboard Daten verarbeiten bei Nutzereingaben
app.post('/dashboard',(req, res) => {
  
  let nachricht = 0;
  if (req.session.userExp == 1) {

    let clicked_user = req.body[Object.keys(req.body)[Object.keys(req.body).length - 1]].replace(/\s+/g, '');
    delete req.body.user_id;

    Object.keys(req.body).forEach(element => {
      qry_exp_rate = `UPDATE NutzerThema SET ExpRate = ` + req.body[element] + ` WHERE ThemaID = ` + element + ` AND NutzerThema.NutzerID = ` + clicked_user;
      mySqlQuery(qry_exp_rate, () => {
        //1 = erfolgreich gesichert
        nachricht = 1;
      });
    })

    //Seite neu aufrufen:
    qry = `SELECT NutzerID, Vorname, Nachname
    FROM Nutzer
    WHERE Experte = 0`;
    mySqlQuery(qry, (results) => {
      res.render('dashboard', { Benutzertyp: 1, Nutzer: results, Tags: new Array(), ARates: new Array(), Nachricht: nachricht });
    });

  } else {
    Object.keys(req.body).forEach(element => {
      qry = `UPDATE NutzerThema SET AzuRate = ` + req.body[element] + ` WHERE ThemaID = ` + element + ` AND NutzerThema.NutzerID = ${req.session.userId}`;
      mySqlQuery(qry, () => {
        //1 = erfolgreich gesichert
        nachricht = 1;
      });
    })

    qry = `SELECT Thema.ThemaName FROM Thema INNER JOIN NutzerThema ON Thema.ThemaID = NutzerThema.ThemaID AND NutzerThema.NutzerID = ${req.session.userId}`;
    qry2 = `SELECT NutzerThema.AzuRate, NutzerThema.ThemaID FROM NutzerThema WHERE NutzerThema.NutzerID = ${req.session.userId}`;
    qry3 = `SELECT Rucksack.RucksackID, Rucksack.RucksackName, Fortschritt.Fortschritt FROM NutzerRucksack LEFT JOIN Rucksack ON NutzerRucksack.RucksackID = Rucksack.RucksackID LEFT JOIN Fortschritt ON NutzerRucksack.RucksackID = Fortschritt.RucksackID AND NutzerRucksack.NutzerID = Fortschritt.NutzerID WHERE NutzerRucksack.NutzerID = ${req.session.userId}`;
    mySqlQuery(qry, (results) => {
      mySqlQuery(qry2, (results2) => {
        mySqlQuery(qry3, (results3) => {
          res.render('dashboard', { Benutzertyp: req.session.userExp, Tags: results, Rates: results2, Rucksack: results3, Nachricht: nachricht });
        });
      });
    });
  }
})
app.post('/dashboardRucksack',(req, res) => {
  
  let nachricht = 0;
  if (req.session.userExp == 1) {

    let clicked_user = req.body[Object.keys(req.body)[Object.keys(req.body).length - 1]].replace(/\s+/g, '');
    delete req.body.user_id;

    Object.keys(req.body).forEach(element => {
      qry_exp_rate = `UPDATE NutzerThema SET ExpRate = ` + req.body[element] + ` WHERE ThemaID = ` + element + ` AND NutzerThema.NutzerID = ` + clicked_user;
      mySqlQuery(qry_exp_rate, () => {
        //1 = erfolgreich gesichert
        nachricht = 1;
      });
    })

    //Seite neu aufrufen:
    qry = `SELECT NutzerID, Vorname, Nachname
    FROM Nutzer
    WHERE Experte = 0`;
    mySqlQuery(qry, (results) => {
      res.render('dashboard', { Benutzertyp: 1, Nutzer: results, Tags: new Array(), ARates: new Array(), Nachricht: nachricht });
    });

  } else {
    Object.keys(req.body).forEach(element => {
      qry = `UPDATE Fortschritt SET Fortschritt = ` + req.body[element] + ` WHERE RucksackID = ` + element + ` AND NutzerID = ${req.session.userId}`;
      mySqlQuery(qry, () => {
        //1 = erfolgreich gesichert
        nachricht = 1;
      });
    })

    qry = `SELECT Thema.ThemaName FROM Thema INNER JOIN NutzerThema ON Thema.ThemaID = NutzerThema.ThemaID AND NutzerThema.NutzerID = ${req.session.userId}`;
    qry2 = `SELECT NutzerThema.AzuRate, NutzerThema.ThemaID FROM NutzerThema WHERE NutzerThema.NutzerID = ${req.session.userId}`;
    qry3 = `SELECT Rucksack.RucksackID, Rucksack.RucksackName, Fortschritt.Fortschritt FROM NutzerRucksack LEFT JOIN Rucksack ON NutzerRucksack.RucksackID = Rucksack.RucksackID LEFT JOIN Fortschritt ON NutzerRucksack.RucksackID = Fortschritt.RucksackID AND NutzerRucksack.NutzerID = Fortschritt.NutzerID WHERE NutzerRucksack.NutzerID = ${req.session.userId}`;
    mySqlQuery(qry, (results) => {
      mySqlQuery(qry2, (results2) => {
        mySqlQuery(qry3, (results3) => {
          res.render('dashboard', { Benutzertyp: req.session.userExp, Tags: results, Rates: results2, Rucksack: results3, Nachricht: nachricht });
        });
      });
    });
  }
})
//Code für die Auflistung der Themen bei der Auswahl des Azubis des Experten
app.post('/dashboard_azulist', (req, res) => {

  //entferne alle whitespaces und absätze des empfangenen "Klicks"
  let clicked_id = Object.keys(req.body)[0].replace(/\s+/g, '');

  qry_tags = `SELECT Thema.ThemaName, Thema.ThemaID
  FROM Thema INNER JOIN NutzerThema 
  ON Thema.ThemaID = NutzerThema.ThemaID AND NutzerThema.NutzerID =` + clicked_id;

  qry_azu_rates = `SELECT NutzerThema.AzuRate, NutzerThema.ExpRate
  FROM NutzerThema WHERE NutzerThema.NutzerID =` + clicked_id;

  //Nachricht 0 = alles ok
  //Nachricht 1 = keine Tags unter diesem Azubi gefunden

  mySqlQuery(qry_tags, (results2) => {
    if (results2.length == 0) {
      res.send({ Tags: results2, ARates: [], Nachricht: 1 });
    } else {
      mySqlQuery(qry_azu_rates, (results3) => {
        res.send({ Tags: results2, ARates: results3, Nachricht: 0 });
      });
    }

  });

})


app.get('/leute', redirectLogin, (req, res) => {
  qry = 'SELECT * FROM Nutzer';
  qry2 = `select Nutzer.NutzerID, Vorname, Nachname, Email, Experte, Notizen, GROUP_CONCAT(ThemaName) as ThemaName
  from Nutzer 
  left join NutzerThema on Nutzer.NutzerID = NutzerThema.NutzerID
  left join Thema on Thema.ThemaID = NutzerThema.ThemaID
  group by Nutzer.NutzerID`;
  mySqlQuery(qry, (results1) => {
    mySqlQuery(qry2, (results2) => {
      res.render('leute', {

        NutzerThema: results1,
        Nutzer: results2
      });
    });
  });
});

app.post('/leute', (req, res) => {
  console.log(req.body);
  qry = 'UPDATE Nutzer SET Notizen = "'+ req.body.notizen +'" WHERE NutzerID = ' + req.body.id;
  mySqlQuery(qry, (result) => {
    console.log("Notizen gespeichert");
    res.redirect('/leute');
  });
});


// Profil
app.get('/profil', redirectLogin, (req, res) => {
    qry = `SELECT * FROM Nutzer WHERE NutzerID=${req.session.userId}`;
    qry2 = `SELECT Thema.ThemaName, Thema.ThemaID FROM Thema INNER JOIN NutzerThema ON Thema.ThemaID = NutzerThema.ThemaID AND NutzerThema.NutzerID = ${req.session.userId}`;
    mySqlQuery(qry, (results) => { 
      mySqlQuery(qry2, (results2) => { 
        res.render('profil', {Benutzertyp: req.session.userExp, Nutzer: results, Themen: results2});
      });
    });
})

// Exp-Thema-Edit
app.get('/thema-edit', redirectLogin, (req, res) => {
    qry = `SELECT Thema.ThemaName, Thema.ThemaID FROM Thema INNER JOIN NutzerThema ON Thema.ThemaID = NutzerThema.ThemaID AND NutzerThema.NutzerID = ${req.session.userId}`;
    mySqlQuery(qry, (results) => { 
      res.render('thema-edit', {Themen: results});
    });
})

// Exp-add-tags
app.get('/add-tags',redirectLogin, (req, res) =>{
  qry = `SELECT distinct ThemaID, ThemaName FROM Thema where Thema.ThemaID not in
  (SELECT Thema.ThemaID FROM Thema inner JOIN NutzerThema 
  ON Thema.ThemaID = NutzerThema.ThemaID where  NutzerThema.NutzerID = ${req.session.userId})`;

  mySqlQuery(qry, (results) => {
    res.render('add-tags', { Themen: results });
  });
})

// Exp-add-tags results
app.post('/add-tags', (req, res) =>{
  //add each checked tag to table "NutzerThema"
  Object.keys(req.body).forEach(element => {
    qry_add = `INSERT INTO NutzerThema (NutzerID, ThemaID, ExpRate, AzuRate) VALUES (${req.session.userId},` + element + `,0,0)`;
    mySqlQuery(qry_add, (results) => {

    });
  })

  qry = `SELECT Thema.ThemaName, Thema.ThemaID FROM Thema INNER JOIN NutzerThema ON Thema.ThemaID = NutzerThema.ThemaID AND NutzerThema.NutzerID = ${req.session.userId}`;
  mySqlQuery(qry, (results) => {
    res.render('thema-edit', { Themen: results });
  });

})

// Exp-remove-tags
app.post('/remove-tags', (req, res) => {

  //remove each checked tag to table "NutzerThema"
  Object.keys(req.body).forEach(element => {
    qry_remove = `DELETE FROM NutzerThema WHERE NutzerThema.ThemaID=` + element + ` AND NutzerThema.NutzerID = ${req.session.userId}`;
    mySqlQuery(qry_remove, (results2) => {
    });
  })

  qry = `SELECT Thema.ThemaName, Thema.ThemaID FROM Thema INNER JOIN NutzerThema ON Thema.ThemaID = NutzerThema.ThemaID AND NutzerThema.NutzerID = ${req.session.userId}`;
  mySqlQuery(qry, (results) => { 
    res.render('thema-edit', {Themen: results});
  });
})

// PW-edit
app.get('/pw-edit', redirectLogin, (req, res) => {
  qry = `SELECT * FROM Nutzer WHERE NutzerID=${req.session.userId}`;
  mySqlQuery(qry, (results) => {
    res.render('pw-edit', { Nutzer: results, Nachricht: 0 });
  });
})

app.post('/pw-edit', (req, res) => {

  let obj = JSON.parse(JSON.stringify(req.body));
  let pw1 = JSON.parse(JSON.stringify(obj.password1));
  let pw2 = JSON.parse(JSON.stringify(obj.password2));
  let pw3 = JSON.parse(JSON.stringify(obj.password3));

  let Nachricht = 0;
  let pw_stimmt = false;

  function ende() {
    qry = `SELECT * FROM Nutzer WHERE NutzerID=${req.session.userId}`;
    mySqlQuery(qry, (results) => {
      res.render('pw-edit', { Nutzer: results, Nachricht });
    });
  }

  function weiter() {
    console.log("weiter() ", Nachricht);
    if (!pw_stimmt) {
      Nachricht = 1;
    }
    else if (pw1 === pw2) {
      qry = `UPDATE Nutzer SET Passwort = '${pw1}' WHERE NutzerID = ${req.session.userId}`;
      mySqlQuery(qry, () => {
        Nachricht = 2;
      });
    }
    else {
      Nachricht = 3;
    }
    ende();
  }

  qry = `SELECT Passwort FROM Nutzer WHERE NutzerID=${req.session.userId}`;
  mySqlQuery(qry, (results) => {
    results.forEach(function (data) {
      if (data.Passwort === pw3) { pw_stimmt = true; }
      weiter();
    })
  });

})

app.get('/suchen', redirectLogin, (req, res) => {
  console.log("SuchRequest: ", req.query.suchen);
  let suchenElem = req.query.suchen;
  let suchen = suchenElem.split(' ');
  let nvQrySuche = 'INSERT INTO NutzerSuchen (ns_NutzerID, ns_suche) VALUES (' + user.id + ', "' + suchenElem + '")';

  // Überthemen aller Suchbegriffe suchen
  /* 
    Wenn also C gesucht wird, wird stattdessen Programmierung angezeigt
    und C steht als Unterthema unter Programmierung als Karte
    Um Dopplungen zu vermeiden (C, C++) wird es mit UNION gelöst
  */
  let suchenQryThema = 'SELECT t.* FROM Thema t WHERE ';
  suchenQryThema = suchQuery(suchenQryThema, suchen, "t.ThemaName");
  suchenQryThema +=
    ' AND t.TeilVon IS NULL ' +
    'UNION ' +
    'SELECT t2.* ' +
    'FROM Thema t1 ' +
    ' INNER JOIN Thema t2 ON t1.TeilVon = t2.ThemaID WHERE ';
  suchenQryThema = suchQuery(suchenQryThema, suchen, "t1.ThemaName");

  thema_inhalt = 'SELECT Thema.ThemaName, Thema.Farbe, Thema.TeilVon FROM Thema WHERE Thema.TeilVon IS NOT NULL';

  // Suchergebnis Lernstoff und Übungen
  // Ist so groß, weil die ganzen Inhaltstabellen dazugejoint werden müssen
  let inhalt_qry =
    'SELECT DISTINCT i.InhaltID, i.InhaltName, i.Information, DATE_FORMAT(i.ErstelltAm, "%d.%c.%Y") AS ErstelltAm, n.Nachname, m.Link, i.Übung, ' +
    '(SELECT TypName FROM MaterialTyp mt  WHERE m.TypID = mt.TypID) AS TypName, ip.pSeite AS pSeite, iv.Zeitstempel, ib.ISBN, ib.Kapitel, ib.bSeite AS bSeite ' +
    'FROM Inhalt i ' +
    ' LEFT JOIN Nutzer n ON i.ErstelltVon = n.NutzerID ' +
    ' INNER JOIN Material m ON i.MaterialID = m.MaterialID ' +
    ' LEFT JOIN InhaltThema it ON i.InhaltID = it.InhaltID ' +
    ' LEFT JOIN Thema t ON it.ThemaID = t.ThemaID ' +
    ' LEFT JOIN InhaltBuch ib ON ib.InhaltID = i.InhaltID ' +
    ' LEFT JOIN InhaltPDF ip ON ip.InhaltID = i.InhaltID ' +
    ' LEFT JOIN InhaltVideo iv ON iv.InhaltID = i.InhaltID ' +
    'WHERE ';
  inhalt_qry = suchQuery(inhalt_qry, suchen, "ThemaName");
  inhalt_qry = inhalt_qry + " OR ";
  inhalt_qry = suchQuery(inhalt_qry, suchen, "InhaltName");

  // Suchergebnis Themen
  thema_qry =
    'SELECT it.InhaltID, t.ThemaName, t.Farbe ' +
    'FROM Thema t ' +
    ' INNER JOIN InhaltThema it ON t.ThemaID = it.ThemaID';

  rucksackInhalt_qry ='SELECT * FROM RucksackInhalt';
  rucksack_qry ='SELECT RucksackID, RucksackName FROM Rucksack';

  
  mySqlQuery(nvQrySuche, () => {
    mySqlQuery(suchenQryThema, (themen) => { 
      mySqlQuery(thema_inhalt, (thema_i) => { 
        mySqlQuery(inhalt_qry, (inhalt) => { 
          mySqlQuery(thema_qry, (thema) => {
            mySqlQuery(rucksackInhalt_qry, (rucksackInhalt) => { 
              mySqlQuery(rucksack_qry, (rucksack) => {
                res.render('suchergebnisse', {
                  RucksackInhalt: rucksackInhalt,
                  AllRucksack: rucksack,
                  suchenQryThema: themen,
                  thema_inhalt: thema_i,
                  Inhalt: inhalt,
                  Thema: thema
                });
              });
            });
          });
        });
      });
    });
  });
})

app.post('/suchergebnis', async (req, res) => {
  const { inhaltAddRuck, selectedRucksack } = req.body;
  if(inhaltAddRuck && selectedRucksack){
    qry_inhaltToRucksack = `INSERT INTO RucksackInhalt (RucksackID, InhaltID) VALUES ("${selectedRucksack}", "${inhaltAddRuck}");`

    mySqlQuery(qry_inhaltToRucksack, (results_inhaltToRucksack) => {
      res.redirect('/rucksack');
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server gestartet auf Port ${PORT}`)
})

// Beispielseite für Datei-Upload
app.get('/upload',redirectLogin, redirectAzi, (req, res) => {
  qry = 'SELECT ThemaName FROM Thema';
  mySqlQuery(qry,(results) => {
    res.render('upload', {Thema:results});
  });
})

//Inhaltserstellung
app.get('/inhalt', redirectLogin, redirectAzi, (req, res) => {
  qry = 'SELECT MaterialName, TypID FROM Material';
  qry2 = 'SELECT ThemaName FROM Thema';
  eigene_qry = 'SELECT Inhalt.InhaltID, Inhalt.InhaltName, Material.Link, Material.TypID, InhaltVideo.Zeitstempel, InhaltPDF.pSeite' + 
                ' FROM Inhalt LEFT OUTER JOIN Material ON Inhalt.MaterialID = Material.MaterialID' +
                ' LEFT OUTER JOIN InhaltPDF ON Inhalt.InhaltID = InhaltPDF.InhaltID' +
                ' LEFT OUTER JOIN InhaltVideo ON Inhalt.InhaltID = InhaltVideo.InhaltID  WHERE Inhalt.ErstelltVon = ' + req.session.userId ;
  mySqlQuery(qry, (Material) => {
    mySqlQuery(qry2, (Themen) => {
      mySqlQuery(eigene_qry, (eigene) => {
        res.render("inhalt", {
          qry: Material,
          qry2: Themen,
          Eigene: eigene,
        });
      });
    });
  })
})

app.post('/inhalt', async (req, res) => {
  const { inhaltName, inhaltReN, inhaltDel } = req.body;
  if(inhaltName && inhaltReN){
    qry_inhalt = `UPDATE Inhalt SET InhaltName ="${inhaltName}" WHERE InhaltID ="${inhaltReN}";`

    mySqlQuery(qry_inhalt, (results_inhalt) => {
      res.redirect('/inhalt');
    });
  }
  if(inhaltDel){
    qry_inhatvideo = `DELETE FROM InhaltVideo WHERE InhaltID ="${inhaltDel}";`
    qry_inhaltpdf = `DELETE FROM InhaltPDF WHERE InhaltID ="${inhaltDel}";`
    qry_inhaltbuch = `DELETE FROM InhaltBuch WHERE InhaltID ="${inhaltDel}";`
    qry_rucksackinhalt = `DELETE FROM RucksackInhalt WHERE InhaltID ="${inhaltDel}";`
    qry_inhaltthema = `DELETE FROM InhaltThema WHERE InhaltID ="${inhaltDel}";`
    qry_inhalt = `DELETE FROM Inhalt WHERE InhaltID ="${inhaltDel}";`

    mySqlQuery(qry_inhatvideo, (results_inhatvideo) => {
      mySqlQuery(qry_inhaltpdf, (results_inhaltpdf) => {
        mySqlQuery(qry_inhaltbuch, (results_inhaltbuch) => {
          mySqlQuery(qry_rucksackinhalt, (results_rucksackinhalt) => {
            mySqlQuery(qry_inhaltthema, (results_inhaltthema) => {   
              mySqlQuery(qry_inhalt, (results_inhalt) => {
                res.redirect('/inhalt');
              });   
            });
          });
        });
      });
    });
  }
});

// Materialien
app.get('/material',redirectLogin, redirectAzi, (req, res) => {
  qry = 'SELECT ThemaName FROM Thema';
  eigene_qry = 'SELECT * FROM Material WHERE ErstelltVon = '+req.session.userId;
  mySqlQuery(qry, (results) => {
    mySqlQuery(eigene_qry, (eigene) => {
      res.render("material", {
        Eigene: eigene,
        Thema: results
      });
    });
  })
})

// Backend Inhalt POST
app.post('/inhaltErstellung', redirectLogin, async (req, res) => {
  const { name, materialname, themaname, info, bookisbn, bookcap, pdfbook, vidtimestamp } = req.body
  let dataname = name;
  var str = themaname + ""
  themaarr = str.split(",");
  console.log(dataname, materialname, themaname, info, bookisbn, bookcap, pdfbook, vidtimestamp);
  if (dataname && materialname && themaname && info) {
    // inhalt entries: InhaltID(0), InhaltName,Info,MaterialID,UserID
    matidqry = `SELECT MaterialID FROM Material Where MaterialName = "${materialname}"`
    mySqlQuery(matidqry, (matidresult) => {
      let matid = matidresult[0].MaterialID;
      checkqry = `SELECT * FROM Inhalt Where InhaltName = "${dataname}"`;
      mySqlQuery(checkqry, (checkresults) => {
        if (checkresults && checkresults.length > 0) {
          console.log("Error ein Inhalt mit demselben name existiert schon!")
          res.redirect("inhalt");
        } else {
          insertqry = `INSERT INTO Inhalt ( InhaltName, Information, MaterialID, ErstelltVon, Übung)
                       VALUES ( "${dataname}", "${info}", "${matid}", "${req.session.userId}", "${0}")`;
          mySqlQuery(insertqry, (insertres1) => {
            inhID = insertres1.insertId;
            console.log("Inhalt ID : "+inhID +" insert was successful!")
            for (var i = 0; i < themaarr.length; i++) {
              check_themaqry = `SELECT ThemaID FROM Thema Where ThemaName = "${themaarr[i]}"`;
              mySqlQuery(check_themaqry, (check_thema_results) => {
                theID = check_thema_results[0].ThemaID;
                // // inhaltThema (link) entries: InhaltThemaID(0), InhaltID,ThemaID
                insrt_themaqry = `INSERT INTO InhaltThema ( InhaltID, ThemaID)
                          VALUES ( "${inhID}", "${theID}")`;
                mySqlQuery(insrt_themaqry, (insrt_thema_results) => { 
                  console.log("InhaltThema ID "+i+" : "+theID +" insert was successful!")
                });
              });
            };
            if ((bookcap || pdfbook) && bookisbn) {// inhaltbuch entries: Buchid(0), inhaltID, ISBN, Kapitel, Seite)
              console.log("here book : " + inhID + " " + bookisbn + " " + bookcap + " " + pdfbook)
              insertbook = `INSERT INTO InhaltBuch ( InhaltID, ISBN, Kapitel, bSeite)
                       VALUES ( "${inhID}", "${bookisbn}", "${bookcap}", "${pdfbook}")`;
              mySqlQuery(insertbook, (insertbook_results) => {
               bookID = insertbook_results.insertId;
                console.log("InhaltBuch ID : " + bookID)
              });
            }
            else if (!(bookcap && bookisbn) && pdfbook) {// inhaltpdf entries: pdfid(0), inhaltID, Seite
              console.log("here pdf : " + inhID + " " + pdfbook)
              insertpdf = `INSERT INTO InhaltPDF ( InhaltID, pSeite)
                       VALUES ( "${inhID}", "${pdfbook}")`;
              mySqlQuery(insertpdf, (insertpdf_results) => {
                pdfID = insertpdf_results.insertId;
                console.log("InhaltBuch ID : " + pdfID)
              });
            }
            else if (vidtimestamp) {// inhaltVideo entries: vidid(0), inhaltID, Timestamp
              console.log("here video : " + inhID + " " + vidtimestamp)
              insertvid = `INSERT INTO InhaltVideo ( InhaltID, Zeitstempel)
                       VALUES ( "${inhID}", "${vidtimestamp}")`;
              mySqlQuery(insertvid, (insertvid_results) => {
                vidID = insertvid_results.insertId;
                console.log("InhaltBuch ID : " + vidID)
              });
            }
          });
          res.redirect('inhalt')
        }
      });
    });
  }
});


// Backend Inhalt POST
app.post('/inhaltErstellung', redirectLogin, async (req, res) => {
  const { dataname, materialname, themaname, info, bookisbn, bookcap, pdfbook, vidtimestamp } = req.body
  var str = themaname + ""
  themaarr = str.split(",");
  if (dataname && materialname && themaname && info) {
    // inhalt entries: InhaltID(0), InhaltName,Info,MaterialID,UserID
    matidqry = `SELECT MaterialID FROM Material Where MaterialName = "${materialname}"`
    mySqlQuery(matidqry, (matidresult) => {
      let matid = matidresult[0].MaterialID;
      checkqry = `SELECT * FROM Inhalt Where InhaltName = "${dataname}"`;
      mySqlQuery(checkqry, (checkresults) => {
        if (checkresults && checkresults.length > 0) {
          console.log("Error ein Inhalt mit demselben name existiert schon!")
          res.redirect("inhalt");
        } else {
          insertqry = `INSERT INTO Inhalt ( InhaltName, Information, MaterialID, ErstelltVon, Übung)
                       VALUES ( "${dataname}", "${info}", "${matid}", "${req.session.userId}", "${0}")`;
          mySqlQuery(insertqry, (insertres1) => {
            inhID = insertres1.insertId;
            console.log("Inhalt ID : "+inhID +" insert was successful!")
            for (var i = 0; i < themaarr.length; i++) {
              check_themaqry = `SELECT ThemaID FROM Thema Where ThemaName = "${themaarr[i]}"`;
              mySqlQuery(check_themaqry, (check_thema_results) => {
                theID = check_thema_results[0].ThemaID;
                // // inhaltThema (link) entries: InhaltThemaID(0), InhaltID,ThemaID
                insrt_themaqry = `INSERT INTO InhaltThema ( InhaltID, ThemaID)
                          VALUES ( "${inhID}", "${theID}")`;
                mySqlQuery(insrt_themaqry, (insrt_thema_results) => { 
                  console.log("InhaltThema ID "+i+" : "+theID +" insert was successful!")
                });
              });
            };
            if ((bookcap || pdfbook) && bookisbn) {// inhaltbuch entries: Buchid(0), inhaltID, ISBN, Kapitel, Seite)
              console.log("here book : " + inhID + " " + bookisbn + " " + bookcap + " " + pdfbook)
              insertbook = `INSERT INTO InhaltBuch ( InhaltID, ISBN, Kapitel, bSeite)
                       VALUES ( "${inhID}", "${bookisbn}", "${bookcap}", "${pdfbook}")`;
              mySqlQuery(insertbook, (insertbook_results) => {
               bookID = insertbook_results.insertId;
                console.log("InhaltBuch ID : " + bookID)
              });
            }
            else if (!(bookcap && bookisbn) && pdfbook) {// inhaltpdf entries: pdfid(0), inhaltID, Seite
              console.log("here pdf : " + inhID + " " + pdfbook)
              insertpdf = `INSERT INTO InhaltPDF ( InhaltID, pSeite)
                       VALUES ( "${inhID}", "${pdfbook}")`;
              mySqlQuery(insertpdf, (insertpdf_results) => {
                pdfID = insertpdf_results.insertId;
                console.log("InhaltBuch ID : " + pdfID+" "+pdfbook)
              });
            }
            else if (vidtimestamp) {// inhaltVideo entries: vidid(0), inhaltID, Timestamp
              console.log("here video : " + inhID + " " + vidtimestamp)
              insertvid = `INSERT INTO InhaltVideo ( InhaltID, Zeitstempel)
                       VALUES ( "${inhID}", "${vidtimestamp}")`;
              mySqlQuery(insertvid, (insertvid_results) => {
                vidID = insertvid_results.insertId;
                console.log("InhaltBuch ID : " + vidID)
              });
            }
          });
          res.redirect('inhalt')
        }
      });
    });
  }
});



app.post('/material', async (req, res) => {
  const { materialDel, materialName, materialReN } = req.body;
  if(materialName && materialReN){
    qry_material = `UPDATE Material SET MaterialName ="${materialName}" WHERE MaterialID ="${materialReN}";`
    mySqlQuery(qry_material, (results_material) => {
      res.redirect('/material');
    });
  }
  if(materialDel){
    qry_inhalteVonMat = `SELECT InhaltID FROM Inhalt WHERE MaterialID ="${materialDel}";` 
    mySqlQuery(qry_inhalteVonMat, (IVM) => {
      if(IVM.length!=0){        
        qry_inhatvideo = `DELETE FROM InhaltVideo WHERE InhaltID IN (${IVM[0].InhaltID}`
        qry_inhaltpdf = `DELETE FROM InhaltPDF WHERE InhaltID IN (${IVM[0].InhaltID}`
        qry_inhaltbuch = `DELETE FROM InhaltBuch WHERE InhaltID IN (${IVM[0].InhaltID}`
        qry_rucksackinhalt = `DELETE FROM RucksackInhalt WHERE InhaltID IN (${IVM[0].InhaltID}`
        qry_inhaltthema = `DELETE FROM InhaltThema WHERE InhaltID IN (${IVM[0].InhaltID}`
        qry_inhalt = `DELETE FROM Inhalt WHERE InhaltID IN (${IVM[0].InhaltID}`
        if(IVM.length>1){
          for(var i = 1; i<IVM.length; i++){
            qry_inhatvideo = qry_inhatvideo + `, ${IVM[i].InhaltID}`
            qry_inhaltpdf = qry_inhaltpdf + `, ${IVM[i].InhaltID}`
            qry_inhaltbuch = qry_inhaltbuch + `, ${IVM[i].InhaltID}`
            qry_rucksackinhalt = qry_rucksackinhalt + `, ${IVM[i].InhaltID}`
            qry_inhaltthema = qry_inhaltthema + `, ${IVM[i].InhaltID}`
            qry_inhalt = qry_inhalt + `, ${IVM[i].InhaltID}`
          }
        }
        qry_inhatvideo = qry_inhatvideo + ");"
        qry_inhaltpdf = qry_inhaltpdf + ");"
        qry_inhaltbuch = qry_inhaltbuch + ");"
        qry_rucksackinhalt = qry_rucksackinhalt + ");"
        qry_inhaltthema = qry_inhaltthema + ");"
        qry_inhalt = qry_inhalt + ");"
        qry_material = `DELETE FROM Material WHERE MaterialID ="${materialDel}";`

        mySqlQuery(qry_inhatvideo, (results_inhatvideo) => {
          mySqlQuery(qry_inhaltpdf, (results_inhaltpdf) => {
            mySqlQuery(qry_inhaltbuch, (results_inhaltbuch) => {
              mySqlQuery(qry_rucksackinhalt, (results_rucksackinhalt) => {
                mySqlQuery(qry_inhaltthema, (results_inhaltthema) => {
                  mySqlQuery(qry_inhalt, (results_inhalt) => {
                    mySqlQuery(qry_material, (results_material) => {
                      res.redirect('/material');
                    });
                  });
                });
              });
            });
          });
        });
      }else{
        qry_material = `DELETE FROM Material WHERE MaterialID ="${materialDel}";`
        mySqlQuery(qry_material, (results_material) => {
          res.redirect('/material');
        });
      }
    })
  } 
});

app.post('/materialUpload',redirectLogin, async (req, res) => {
  dateiUpload(req, () => {
  });
  res.redirect('material');
})


app.get('/pdferstellung', redirectLogin, redirectAzi, (req, res) => {
  qry = 'SELECT MaterialName, TypID FROM Material';
  mySqlQuery(qry, (Material) => {
      res.render('pdferstellung', {
        qry: Material
      });
  });
})

app.post('/pdferstellung',redirectLogin, redirectAzi, (req, res) => {
  editPDF(req);
  res.redirect('pdferstellung')    
  
});

function suchQuery(qry, suchen, spalte) {
  qry += ' ( ';
  for (let i = 0; i < suchen.length; i++) {
    if (i != 0) {
      qry += ' OR ';
    }
    if (suchen[i].startsWith("#")) { // Sucht nach exaktem Thema, wenn mit # gestartet
      qry += spalte + " = '" + suchen[i].substring(1) + "'";
    } else { // Ansonsten normal
      qry += spalte + " LIKE '%" + suchen[i] + "%'";
    }
  }
  qry += ' ) ';
  return qry;

}