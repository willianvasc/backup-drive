## Backup e Upload de Arquivos para o Google Drive

Este projeto Node.js demonstra como compactar uma pasta e fazer o upload dela para o Google Drive usando a API do Google Drive. O projeto utiliza `express` para o servidor, `JSZip` para criar arquivos zip e `googleapis` para interagir com o Google Drive.

#### Pré-requisitos

1. **Node.js** instalado na sua máquina.
2. **Projeto Google Cloud Platform (GCP)** com a API do Google Drive habilitada.
3. **Conta de Serviço** criada e chave JSON baixada.

#### Estrutura do Projeto

```
project-root/
│
├── credentials.json
├── index.js
├── package.json
└── README.md
```

#### Dependências

Certifique-se de ter as seguintes dependências no seu `package.json`:

```json
{
  "name": "google-drive-backup",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "express": "^4.17.1",
    "googleapis": "^39.2.0",
    "jszip": "^3.5.0"
  }
}
```

Instale as dependências usando:

```bash
npm install
```

#### Autenticação

Coloque seu arquivo `credentials.json` na raiz do projeto. Este arquivo contém as credenciais para sua conta de serviço.

#### Explicação do Código

O código principal está em `index.js`. Abaixo está uma explicação de seus componentes:

1. **Dependências e Configuração:**

```javascript
const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");
const JSZip = require("jszip");
var express = require('express');
var app = express();
const GOOGLE_API_FOLDER_ID = "ID_DA_PASTA_DO_GOOGLE_DRIVE";
```

2. **Autenticação do Google Drive:**

```javascript
const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: "https://www.googleapis.com/auth/drive",
});
const drive = google.drive({
    version: "v3",
    auth,
});
```

3. **Função para Compactar e Fazer o Upload:**

```javascript
async function zipAndUpload(folderPath, parentFolderId) {
    const zip = new JSZip();

    const addFolderToZip = async (folderPath, zip, parentFolder = "") => {
        const files = fs.readdirSync(folderPath);

        for (const file of files) {
            const filePath = path.join(folderPath, file);
            const stats = fs.statSync(filePath);

            if (stats.isDirectory()) {
                await addFolderToZip(filePath, zip, path.join(parentFolder, file));
            } else {
                const fileContent = fs.readFileSync(filePath);
                zip.file(path.join(parentFolder, file), fileContent);
            }
        }
    };

    await addFolderToZip(folderPath, zip);
    const content = await zip.generateAsync({ type: "nodebuffer" });
    fs.writeFileSync("backup.zip", content);

    try {
        const fileMetadata = {
            name: "backup.zip",
            parents: [parentFolderId],
        };

        const media = {
            mimeType: "application/zip",
            body: fs.createReadStream("backup.zip"),
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
```

4. **Configuração do Servidor Express:**

```javascript
app.listen(3000, function () {
    zipAndUpload("../CAMINHO_PARA_SER_COMPACTADO", GOOGLE_API_FOLDER_ID)
    .then(() => {
        console.log('Arquivos enviados com sucesso!');
    })
    .catch((err) => {
        console.error('Erro ao enviar arquivos: ' + err.message);
    });
});
```

#### Executando o Projeto

1. **Inicie o Servidor:**

```bash
node index.js
```

2. **Verifique o Upload:**

O servidor irá compactar a pasta especificada e fazer o upload dela para a pasta do Google Drive especificada por `GOOGLE_API_FOLDER_ID`.

### Conclusão

Este projeto demonstra como automatizar o processo de compactação de um diretório e fazer o upload dele para o Google Drive usando Node.js. A combinação de `JSZip` e `googleapis` facilita a gestão de operações de arquivos e a interação com o Google Drive.
