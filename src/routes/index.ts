import * as Express from 'express';

import zoushigaya from "../scraping/zoushigaya"
import kotoKu from "../scraping/koto-ku"
import sumidaKu from "../scraping/sumida-ku"
import { Client, middleware, ClientConfig, MiddlewareConfig } from "@line/bot-sdk";

const router = Express.Router();

let lineConfig: ClientConfig | MiddlewareConfig
let lineBot
if (process.env.LINE_ACCESS_TOKEN && process.env.LINE_CHANNEL_SECRET) {
  lineConfig = {
    channelAccessToken: process.env.LINE_ACCESS_TOKEN,
    channelSecret: process.env.LINE_CHANNEL_SECRET
  }
  lineBot = new Client(lineConfig as ClientConfig)
}

router.get('/', async (req, res) => {
  res.render("index", {message: 'message'});
})

router.get('/zoushigaya', async (req, res) => {
  const month = req.query.month as string
  const roomIds = req.query.roomIds as string[]
  const isLoginMode = req.query.isLoginMode === 'true'
  // TODO: まともなエラーハンドリング
  let error = null;
  if (month) {
    try {
      await zoushigaya(month, '01', roomIds, isLoginMode);
    } catch (e) {
      error = e
    }
  }
  res.render("zoushigaya/index", { month, roomIds, error });
})

router.get('/koto-ku', async (req, res) => {
  const month = req.query.month as string
  const day = req.query.day as string
  // TODO: まともなエラーハンドリング
  let error = null;
  if (month) {
    try {
      await kotoKu(month, day);
    } catch (e) {
      error = e
    }
  }
  res.render("koto-ku/index", { month, day, error });
})

router.get('/sumida-ku', async (req, res) => {
  const month = req.query.month as string
  const buildingkeys = req.query.buildingkeys as string[]
  // TODO: まともなエラーハンドリング
  let error = null;
  if (month) {
    try {
      await sumidaKu(month, '1', buildingkeys);
    } catch (e) {
      error = e
    }
  }
  res.render("sumida-ku/index", { month, buildingkeys, error });
})

router.get('/webhook', middleware(lineConfig as MiddlewareConfig), async (req, res) => {
  // 先行してLINE側にステータスコード200でレスポンスする。
  res.sendStatus(200);

  // すべてのイベント処理のプロミスを格納する配列。
  const events_processed: Promise<any>[] = [];    
  // イベントオブジェクトを順次処理。
  req.body.events.forEach((event) => {
    // この処理の対象をイベントタイプがメッセージで、かつ、テキストタイプだった場合に限定。
    if (event.type == "message" && event.message.type == "text"){
      // ユーザーからのテキストメッセージが「ヘルプ」だった場合のみ反応。
      if (event.message.text == "bashotoriヘルプ"){
        // replyMessage()で返信し、そのプロミスをevents_processedに追加。
        events_processed.push(lineBot.replyMessage(event.replyToken, {
          type: "text",
          text: "bashotori のヘルプです"
        }));
      }
    }
  });

  // すべてのイベント処理が終了したら何個のイベントが処理されたか出力。
  const response = await Promise.all(events_processed)
  console.log(`${response.length} event(s) processed.`)
})

export default router;
