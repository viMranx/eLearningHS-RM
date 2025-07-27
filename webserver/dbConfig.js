require('dotenv').config()
const { Client } = require('ssh2');
const sshClient = new Client();
const mysql = require('mysql2');

const dbServer = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
}

const tunnelConfig = {
host: process.env.DB_SSH_HOST,
port: 22,
username: process.env.DB_SSH_USER,
privateKey:
require('fs').readFileSync('./ssh-key/id_rsa')
}
//g
const forwardConfig = {
    srcHost: '127.0.0.1',
    srcPort: 3306,
    dstHost: dbServer.host,
    dstPort: dbServer.port
};

const SSHConnection = new Promise((resolve, reject) => {
    sshClient.on('ready', () => {
        sshClient.forwardOut(
        forwardConfig.srcHost,
        forwardConfig.srcPort,
        forwardConfig.dstHost,
        forwardConfig.dstPort,
        (err, stream) => {
            if (err) reject(err);
            const updatedDbServer = {
                ...dbServer,
                stream
            };
            const connection =  mysql.createConnection(updatedDbServer);
            connection.connect((error) => {
            if (error) {
                reject(error);
            }
            resolve(connection);
            });
        });
    }).connect(tunnelConfig);
});


module.exports = function mySqlQuery(qry, callback) {
    SSHConnection.then((connection) => {
        connection.query(qry, (error, results, fields) => {
            if (error) { console.log(error); }
            // console.log("SQL-Ergebnis:", results);
            return callback(results);
        });
    });
}

// Alternativ, falls mehrere Module exportiert werden müssen
// module.exports = {
//     dbServer,
//     tunnelConfig,
//     forwardConfig,
//     SSHConnection,
//     mySqlQuery
// }