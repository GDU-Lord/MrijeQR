import TelegramBot from "node-telegram-bot-api";
import { LocalState } from "./core/state.js";

export function getStateArgs(state: LocalState) {
  return (state.lastInput as TelegramBot.Message).text!.split(" ");
}