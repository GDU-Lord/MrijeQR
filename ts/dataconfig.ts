export function getIdentifier(row: string[]) {
  return (row[2] + " " + row[3]).replaceAll(/[^A-Za-z0-9]/g, "_");
}

export function getIdentifierFromTable(table: string[][], selector: string) {
  for(const e of table) {
    if(e[3].trim().replaceAll("@", "") === selector) {
      return getIdentifier(e.slice(0,4));
    }
  }
  return null;
}