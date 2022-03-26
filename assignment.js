const fs = require('fs');
const got = require('got');
const url = require('url');
const { getAuthToken, getSpreadSheet, getSpreadSheetValues, addSheet, updateCells } = require('./googleSheetsService.js');
const dotenv = require('dotenv');
dotenv.config();

const spreadsheetId = process.env.SPREADSHEET_ID;
const sheetName = process.env.SHEET_NAME;
const sheetId = 123456;

// const url='https://sugarcosmetics.com/products/nothing-else-matter-longwear-lipstick-08-berry-picking-berry';

let websites = [];
let productList = [];

async function testGetSpreadSheet() {
  try {
    const auth = await getAuthToken();
    const response = await getSpreadSheet({
      spreadsheetId,
      auth
    })
    console.log('output for getSpreadSheet', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log(error.message, error.stack);
  }
}

async function testGetSpreadSheetValues() {
  try {
    const auth = await getAuthToken();
    const response = await getSpreadSheetValues({
      spreadsheetId,
      sheetName,
      auth
    })
    websites = response.data.values;
    // console.log(websites);
    // console.log('output for getSpreadSheetValues', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log(error.message, error.stack);
  }
}

async function addSheetToSpreadSheet() {
  const auth = await getAuthToken();
  const requests = {
    "addSheet": {
      "properties": {
        "sheetId": sheetId,
        "title": "Processed Sheet",
        "gridProperties": {
          "rowCount": 40,
          "columnCount": 12
        },
        "tabColor": {
          "red": 1.0,
          "green": 1.0,
          "blue": 1.0
        }
      }
    }
  }

  res = await addSheet(spreadsheetId, auth, requests);

  console.log(res)
}

async function updateCellsInSpreadSheet() {
  const auth = await getAuthToken();
  const requests = {
    "updateCells": {

      "rows": [
        createRow('Product', 'Variant', 'Price', 'Available'),
        productList.map((product) => {
          return createRow(product[0], product[1], product[2], product[3]);
        })
      ],
      "fields": "userEnteredValue",
      "start": {
        "sheetId": sheetId,
        "rowIndex": 0,
        "columnIndex": 0
      },
    }
  }

  res = await updateCells(spreadsheetId, auth, requests);
  console.log(res)
}

function createRow(a, b, c, d) {
  const row_obj = {
    "values": [
      {
        "userEnteredValue": {
          "stringValue": a,
        },
      },
      {
        "userEnteredValue": {
          "stringValue": b,
        },
      },
      {
        "userEnteredValue": {
          "stringValue": c,
        },
      },
      {
        "userEnteredValue": {
          "stringValue": d,
        },
      }
    ]
  }
  return row_obj;
}

async function getData(link) {
  apiUrl = "https://prod.api.sugarcosmetics.com/products/prod/getProductsv2?handle="
  // url = 'https://sugarcosmetics.com/products/nothing-else-matter-longwear-lipstick-08-berry-picking-berry';

  let q = url.parse(link, true);
  let product = q.pathname.split('/')[2];

  try {
    const resp = await got(apiUrl + product);
    const json = await JSON.parse(resp.body);
    const variants = json.resbody.variants;

    if (variants.length == 1) {
      productList.push([
        link,
        "",
        variants[0].price,
        (variants[0].inventory_quantity > 0 ? 'FALSE' : 'TRUE')
      ]);
    }
    else {
      for (let i = 0; i < variants.length; i++) {
        productList.push([
          link,
          variants[i].title,
          variants[i].price,
          (variants[i].inventory_quantity > 0 ? 'FALSE' : 'TRUE')
        ]);
      }
    }
    // console.log(productList);
  }
  catch (error) {
    console.error(error);
  }
}


async function updateSpreadSheet() {
  await testGetSpreadSheetValues();
  if (websites.length <= 2) return;
  for (let i = 1; i < websites.length - 1; i++) {
    await getData(websites[i].toString())
  }

  await addSheetToSpreadSheet();
  await updateCellsInSpreadSheet();

  // console.log(productList);
}

async function main() {
  // testGetSpreadSheet();
  // await testGetSpreadSheetValues();
  // addSheetToSpreadSheet();
  // updateCellsInSpreadSheet();
  // getData('https://sugarcosmetics.com/products/nothing-else-matter-longwear-lipstick-08-berry-picking-berry');
  await updateSpreadSheet();
}

main()