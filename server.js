import express from "express";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import { Buffer } from "node:buffer";
import fetch from "node-fetch";
import AdmZip from "adm-zip";
import iconv from "iconv-lite";
import { XMLParser } from "fast-xml-parser";
import variables from "./variables/variables.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getFilePath = path.join(__dirname, variables.getFilePath);
const jsonFilePath = path.join(__dirname, variables.jsonFilePath);

app.use(express.json());

app.get("/", async (req, res) => {
  main();
  res.status(200);
});

const main = async () => {
  try {
    const data = await getData(variables.url);
    unZipFile(data);
    const parseJson = await parseXMLtoJson();
    const objWiteBIC = createJsonWiteBIC(parseJson);
    writeJsonToFS(objWiteBIC);
  } catch (error) {
    errReports(error);
  }
};

const writeJsonToFS = async (json) => {
  try {
    const str = JSON.stringify(json);
    await fs.writeFile(jsonFilePath, str);
    logsReports(variables.messanges[5], jsonFilePath);
  } catch (error) {
    errReports(variables.errors[4], error);
  }
};

const parseXMLtoJson = async () => {
  try {
    const getfileName = await fs.readdir(getFilePath);
    const dataXML = await fs.readFile(getFilePath + getfileName[0]);
    const decodeData = iconv.decode(dataXML, "win1251");

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "",
    });
    const resultObj = parser.parse(decodeData);
    logsReports(variables.messanges[3]);
    return resultObj.ED807.BICDirectoryEntry;
  } catch (error) {
    errReports(variables.errors[2], error);
  }
};

const unZipFile = async (data) => {
  const arrayBuffer = await data.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  try {
    const zip = new AdmZip(buffer);
    zip.extractAllTo(getFilePath, true);
    logsReports(variables.messanges[2], getFilePath);
  } catch (error) {
    errReports(variables.errors[1], error);
  }
};

const getData = async (url) => {
  try {
    const response = await fetch(url);

    if (response.ok) {
      logsReports(variables.messanges[1], response.status);
      return response;
    } else {
      return errReports(
        variables.errors[0],
        response.status,
        response.statusText
      );
    }
  } catch (error) {
    errReports(error);
  }
};

const createJsonWiteBIC = (parserObj) => {
  const arrBanks = [];

  try {
    parserObj.forEach(({ ParticipantInfo, Accounts, BIC }) => {
      if (Accounts) {
        const bankName = ParticipantInfo.NameP;

        if (Array.isArray(Accounts)) {
          const bankData = Accounts.map(({ Account }) => {
            return { bic: BIC, name: bankName, corrAccount: Account };
          });
          arrBanks.push(...bankData);
        } else {
          const bankObj = {
            bic: BIC,
            name: bankName,
            corrAccount: Accounts.Account,
          };

          arrBanks.push(bankObj);
        }
      }
    });

    logsReports(variables.messanges[4]);
  } catch (error) {
    errReports(variables.errors[3], error);
  }

  return [...arrBanks];
};

function logsReports(...logs) {
  console.log(logs);
}

function errReports(...errors) {
  console.log(errors);
}

app.listen(variables.PORT, () => {
  logsReports(variables.messanges[0], variables.PORT);
});
