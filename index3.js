const fs = require("fs");
const path = require("path");
const JSZip = require("jszip");

(async () => {
  // Crie uma nova instância JSZip
  const zip = new JSZip();

  // Caminho para a pasta que você deseja zipar
  const folderPath = "../lura/";

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
})();
