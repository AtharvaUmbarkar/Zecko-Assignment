const { google } = require('googleapis')
const dotenv = require('dotenv');
const sheets = google.sheets('v4');
dotenv.config();

const GCLOUD_PROJECT = process.env.GCLOUD_PROJECT;
const GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS;

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

async function getAuthToken() {
    const auth = new google.auth.GoogleAuth({
        scopes: SCOPES
    });
    const authToken = await auth.getClient();
    return authToken;
}

async function getSpreadSheet({ spreadsheetId, auth }) {
    const res = await sheets.spreadsheets.get({
        spreadsheetId,
        auth,
    });
    return res;
}

async function getSpreadSheetValues({ spreadsheetId, auth, sheetName }) {
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId,
        auth,
        range: sheetName
    });
    return res;
}

async function addSheet( spreadsheetId, auth, requests ) {
    const res = await sheets.spreadsheets.batchUpdate({
        spreadsheetId: spreadsheetId,
        auth:auth,
        requestBody: {
            requests: [requests]
        }
    })
    return res;
}

async function updateCells( spreadsheetId, auth, requests ) {
    const res = await sheets.spreadsheets.batchUpdate({
        spreadsheetId: spreadsheetId,
        auth:auth,
        requestBody: {
            requests: [requests]
        }
    })
    return res;
}

module.exports = {
    getAuthToken,
    getSpreadSheet,
    getSpreadSheetValues,
    addSheet,
    updateCells
}