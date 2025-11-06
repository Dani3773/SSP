const fs = require('fs').promises;
const path = require('path');

const storageDir = path.join(__dirname, 'storage');

/**
 * Lê um arquivo JSON do storage
 * @param {string} filename - Nome do arquivo sem extensão
 * @returns {Promise<Array|Object>} Dados do JSON
 */
async function readJson(filename) {
  try {
    const filePath = path.join(storageDir, `${filename}.json`);
    const data = await fs.readFile(filePath, 'utf8');
    const trimmed = data.trim();
    if (!trimmed) {
      return [];
    }
    return JSON.parse(trimmed);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // Arquivo não existe, retornar array vazio
      return [];
    }
    throw error;
  }
}

/**
 * Escreve dados em um arquivo JSON no storage
 * @param {string} filename - Nome do arquivo sem extensão
 * @param {Array|Object} data - Dados a serem salvos
 */
async function writeJson(filename, data) {
  try {
    const filePath = path.join(storageDir, `${filename}.json`);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    throw error;
  }
}

module.exports = {
  readJson,
  writeJson
};