import { createCanvas, loadImage } from "canvas";
import { Bot } from "./core/index.js";
import * as fs from 'fs';
import path from "path";
import * as QRCode from "qrcode";

const cw = 500;
const ch = 500;

const canvas = createCanvas(cw, ch);

export async function generateTicket(userData: string) {
  const url = await getURL(userData);
  return await generateImage(url);
}

export async function getURL(userData: string) {
  return "https://t.me/" + (await Bot.getMe()).username + "?start=" + userData;
}

export function generateImage(url: string) {
  return new Promise<string | null>(res => {
    console.log("Generating QR...");
    QRCode.toBuffer(url, { errorCorrectionLevel: "H" }, async (err, buffer) => {
      if(err) {
        res(null);
        console.error(err);
        return;
      }
      console.log("Loading QR..");
      const img = await loadImage(buffer);
      console.log("Generating image...");
      const _path = path.join(process.cwd(), 'tickets/test.png');
      console.log(_path);
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, cw, ch);
      ctx.drawImage(img, 10, 10, cw-20, ch-20);
      const out = fs.createWriteStream(_path);
      const stream = canvas.createPNGStream();
      stream.pipe(out);
      out.on("finish", () => {
        console.log("Image generated!");
        res(_path);
      });
    })
    
  });
}