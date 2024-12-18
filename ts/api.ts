console.log("Connecting to the API...");

import { google, sheets_v4 } from "googleapis";
import "dotenv/config.js";
import { getIdentifier, getIdentifierFromTable } from "./dataconfig.js";

async function getGoogleSheetClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.SERVICE_KEY,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const authClient: any = await auth.getClient();
  return google.sheets({
    version: "v4",
    auth: authClient
  });
}

export async function readSheet(): Promise<[any, sheets_v4.Sheets]> {
  const sheets = await getGoogleSheetClient();
  const params: sheets_v4.Params$Resource$Spreadsheets$Values$Get = {
    spreadsheetId: process.env.SHEET_ID,
    range: `${process.env.READ_START}:${process.env.READ_END}`
  };
  return [await sheets.spreadsheets.values.get(params), sheets];
}

export function mark(data: any, identifier: string, sheets: sheets_v4.Sheets) {
  return new Promise<"SUCCESS" | "NOT_FOUND" | "ALREADY_MARKED" | "ERROR">(async function (res) {
    let found = false;
    data.values!.forEach(async (entry: string[], i: number) => {
      const str = getIdentifier(entry);
      if(str === identifier) {
        found = true;
        if(entry[+process.env.MARK_COL_REL_NUM!] !== process.env.MARK_TEXT!) {
          try {
            await sheets.spreadsheets.batchUpdate({
              spreadsheetId: process.env.SHEET_ID!,
              requestBody: { 
                requests: [
                  {
                    repeatCell: {
                      range: {
                        sheetId: +process.env.TAB_ID!,
                        startRowIndex: i,
                        endRowIndex: i + 1
                      },
                      cell: {
                        userEnteredFormat: {
                          backgroundColor: {
                            red: +process.env.FILL_R!,
                            green: +process.env.FILL_G!,
                            blue: +process.env.FILL_B!,
                          },
                        },
                      },
                      fields: 'userEnteredFormat.backgroundColor',
                    },
                  },
                  {
                    updateCells: {
                      fields: "*",
                      range: {
                        sheetId: +process.env.TAB_ID!,
                        startRowIndex: i,
                        endRowIndex: i + 1,
                        startColumnIndex: +process.env.MARK_COL_NUM!,
                        endColumnIndex: +process.env.MARK_COL_NUM! + 1,
                      },
                      rows: [{
                        values: [{
                          userEnteredValue: {
                            stringValue: process.env.MARK_TEXT!
                          }
                        }]
                      }]
                    }
                  }
                ]
              },
            });
            res("SUCCESS");
          } catch (err) {
            res("ERROR");
          }
        }
        else res("ALREADY_MARKED");
      }
    });
    if(!found) res("NOT_FOUND");
  });
 
}

export async function markUser(identifier: string) {
  const [data, sheets] = await readSheet();
  const res = await mark(data.data, identifier, sheets);
  return res;
}

export async function getUserData(username: string) {
  const [data] = await readSheet();
  return getIdentifierFromTable(data.data.values, username);
}