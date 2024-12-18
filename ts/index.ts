import { CHAIN } from "./core/actions.js";
import { on, procedure } from "./core/chain.js";
import { init, Bot } from "./core/index.js";
import "dotenv/config.js";
import { getUserData, markUser } from "./api.js";
import { getStateArgs } from "./utils.js";
import { generateTicket } from "./ticket.js";

// make it case insensitive!

init(process.env.TOKEN as string, {
  polling: {
    interval: 2000,
    params: {
      allowed_updates: ["chat_member", "message", "chat_join_request", "callback_query", "chat_member_updated"]
    }
  }
});

console.log("Сonnected!");

type response = "SUCCESS" | "NOT_FOUND" | "ALREADY_MARKED" | "ERROR";

const verify = procedure();

verify.make()
  .func(async (state) => {
    return state.data?.ADMIN ? CHAIN.NEXT_ACTION : CHAIN.NEXT_LISTENER;
  })
  .send(process.env.MSG_PROCESS!)
  .check(async (state) => {
    const args = getStateArgs(state);
    const id = args[1] ?? "";
    return await markUser(id);
  })
    .sendCase<any, any, response>("SUCCESS", async (state) => {
      return process.env.MSG_SUCCESS!;
    })
    .sendCase<any, any, response>("ALREADY_MARKED", async (state) => {
      return process.env.MSG_ALREADY_MARKED!;
    })
    .sendCase<any, any, response>("ERROR", async (state) => {
      return process.env.MSG_ERROR!;
    })
    .sendCase<any, any, response>("NOT_FOUND", async (state) => {
      return process.env.MSG_NOT_FOUND!;
    })
  .endCase
  .func(async state => {
    state.resolveProcedure(verify);
  });

const getTicket = procedure();

getTicket.make()
  .func(async (state) => {
    const [data, text] = await getUserData(state.lastInput.from?.username ?? "");
    if(data == null || text == null) {
      await Bot.sendMessage(state.core.chatId, process.env.MSG_GET_ERROR!);
      return;
    }
    const imgpath = await generateTicket(data, text);
    if(imgpath == null) {
      await Bot.sendMessage(state.core.chatId, process.env.MSG_GET_ERROR!);
      return;
    }
    await Bot.sendPhoto(state.core.chatId, imgpath);
  })
  .func(async state => {
    state.resolveProcedure(getTicket);
  });

on("message", inp => inp.text!.startsWith("/start"))
  .check(async (state) => {
    const args = getStateArgs(state);
    const key = args[1] ?? "";
    if(key === process.env.ADMIN_KEY)
      return "ADMIN";
    else if(key.startsWith("__get__"))
      return "GET";
    else
      return "VERIFY";
  })
    .funcCase("VERIFY", async (state) => {
      await state.call(verify);
    })
    .sendCase("ADMIN", async (state) => {
      state.data = {
        ADMIN: true
      };
      return process.env.MSG_ADMIN!;
    })
    .funcCase("GET", async (state) => {
      await state.call(getTicket);
    })
  .endCase;