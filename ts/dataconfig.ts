export function getIdentifier(row: string[]) {
  return (row[2] + " " + row[3].replaceAll("@", "")).replaceAll(/[^A-Za-z0-9]/g, "_");
}

export function getIdentifierFromTable(table: string[][], selector: string) {
  for(const e of table) {
    if(e[3].trim().replaceAll("@", "").toUpperCase() === selector.toUpperCase()) {
      return getIdentifier(e.slice(0,4));
    }
  }
  return null;
}

export function getTextFromTable(table: string[][], selector: string) {
  for(const e of table) {
    if(e[3].trim().replaceAll("@", "").toUpperCase() === selector.toUpperCase()) {
      return e[2].trim();
    }
  }
  return null;
}