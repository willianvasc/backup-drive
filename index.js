const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");
const JSZip = require("jszip");
var express = require('express');
var app = express();
const GOOGLE_API_FOLDER_ID = "1TPTxXGQJxMjsRflpguyFAyAFvDhnmtRD";

const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: "https://www.googleapis.com/auth/drive",
});
const drive = google.drive({
    version: "v3",
    auth,
});

async function zipAndUpload(folderPath, parentFolderId) {
    // Crie uma nova instância JSZip
    const zip = new JSZip();

    // Função para percorrer a pasta e adicionar arquivos ao zip
    const addFolderToZip = async (folderPath, zip, parentFolder = "") => {
        const files = fs.readdirSync(folderPath);

        for (const file of files) {
            const filePath = path.join(folderPath, file);
            const stats = fs.statSync(filePath);

            if (stats.isDirectory()) {
                // Se o item é um diretório, chame recursivamente a função
                await addFolderToZip(filePath, zip, path.join(parentFolder, file));
            } else {
                // Se o item é um arquivo, leia o conteúdo e adicione ao zip
                const fileContent = fs.readFileSync(filePath);
                zip.file(path.join(parentFolder, file), fileContent);
            }
        }
    };

    // Adicione a pasta ao zip
    await addFolderToZip(folderPath, zip);

    // Converta o zip em um buffer
    const content = await zip.generateAsync({ type: "nodebuffer" });

    // Salve o arquivo zip
    fs.writeFileSync("example.zip", content);

    // Upload do arquivo zip para o Google Drive
    try {
        const fileMetadata = {
            name: "example.zip",
            parents: [parentFolderId],
        };

        const media = {
            mimeType: "application/zip",
            body: fs.createReadStream("example.zip"),
        };

        const response = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: "id",
        });

        console.log("Arquivo enviado com sucesso para o Google Drive!");
    } catch (err) {
        console.error("Erro ao enviar arquivo para o Google Drive: " + err.message);
    }
}



app.listen(3000, function () {
    zipAndUpload("../lura", GOOGLE_API_FOLDER_ID)
    .then(() => {
        console.log('Arquivos enviados com sucesso!');
    })
    .catch((err) => {
        console.error('Erro ao enviar arquivos: ' + err.message);
    });
});



