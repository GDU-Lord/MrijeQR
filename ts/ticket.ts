import { CanvasTextAlign, createCanvas, Image, loadImage } from "canvas";
import { Bot } from "./core/index.js";
import * as fs from 'fs';
import path from "path";
import * as QRCode from "qrcode";
import { v5 as uuidv5 } from 'uuid';

const cw = +process.env.TICKET_WIDTH!;
const ch = +process.env.TICKET_HEIGHT!;
let template: Image; 

const canvas = createCanvas(cw, ch);

export async function generateTicket(userData: string, text: string) {
  const url = await getURL(userData);
  return await generateImage(url, text);
}

export async function getURL(userData: string) {
  return "https://t.me/" + (await Bot.getMe()).username + "?start=" + userData;
}

export function generateImage(url: string, text: string) {
  return new Promise<string | null>(res => {
    QRCode.toBuffer(url, { 
      errorCorrectionLevel: "H", 
      color: {
        dark: process.env.QR_COLOR!,
        light: "#FFFFFF"
      } 
    }, async (err, buffer) => {
      if(err) {
        res(null);
        console.error(err);
        return;
      }
      const img = await loadImage(buffer);
      if(!template) template = await loadImage(path.join(process.cwd(), 'assets', process.env.TEMPLATE_FILE!));
      const uuid = uuidv5(url, '1b671a64-40d5-491e-99b0-da01ff1f3341');
      const _path = path.join(process.cwd(), `tickets/${uuid}.png`);
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, cw, ch);
      ctx.drawImage(template, 0, 0, cw, ch);
      ctx.drawImage(img, 
        +process.env.QR_LEFT!,
        +process.env.QR_TOP!,
        +process.env.QR_SIZE!,
        +process.env.QR_SIZE!,
      );
      ctx.fillStyle = process.env.FONT_COLOR!;
      ctx.textAlign = process.env.TEXT_ALIGN! as CanvasTextAlign;
      ctx.font = process.env.FONT!;
      ctx.fillText(text,
        +process.env.TEXT_LEFT!,
        +process.env.TEXT_TOP!,
      );
      const out = fs.createWriteStream(_path);
      const stream = canvas.createPNGStream();
      stream.pipe(out);
      out.on("finish", () => {
        res(_path);
      });
    })
    
  });
}