import * as Express from 'express';
import * as fs from 'fs';

import zoushigaya from "../scraping/zoushigaya"
import kotoKu from "../scraping/koto-ku"
import sumidaKu from "../scraping/sumida-ku"
import { Client, middleware, ClientConfig, MiddlewareConfig } from "@line/bot-sdk";

const router = Express.Router();

let lineConfig: ClientConfig | MiddlewareConfig
let lineBot: Client
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

router.post('/webhook', middleware(lineConfig as MiddlewareConfig), async (req, res) => {
  // 先行してLINE側にステータスコード200でレスポンスする。
  res.sendStatus(200);

  // すべてのイベント処理のプロミスを格納する配列。
  const events_processed: Promise<any>[] = [];    
  // イベントオブジェクトを順次処理。
  req.body.events.forEach((event) => {
    // この処理の対象をイベントタイプがメッセージで、かつ、テキストタイプだった場合に限定。
    if (event.type == "message" && event.message.type == "text"){
      const message: string = event.message.text
      // ユーザーからのテキストメッセージが「ヘルプ」だった場合のみ反応。
      if (message === "bashotoriヘルプ"){
        // replyMessage()で返信し、そのプロミスをevents_processedに追加。
        events_processed.push(lineBot.replyMessage(event.replyToken, {
          type: "text",
          text: "「雑司が谷-多目的ホール-11月」\nのように発言してください。\n全部、多目的ホール、音楽室、第1練習室、第2練習室に対応しています。"
        }));
      }
      else {
        const parseMessages = message.split('-')
        if (parseMessages.length !== 3) { return }
        if (parseMessages[0] === '雑司が谷' || parseMessages[0] === '雑司ヶ谷') {
          const roomids = []
          switch (parseMessages[1]) {
            case '全部':
              roomids.push(...['07','10','13','14'])
              break;
            case '音楽室':
              roomids.push('07')
              break;
            case '多目的ホール':
              roomids.push('10')
              break;
            case '第1練習室':
              roomids.push('13')
              break;
            case '第2練習室':
              roomids.push('14')
              break;
            default:
              // TODO: 雑司ヶ谷のヘルプを返す
              console.log('不一致', parseMessages[1])
              return
          }

          const month = parseMessages[2].slice(0, -1)
          if ( isNaN(Number(month)) || month.length > 2) { return }
          
          const pushImage = async() => {
            // 個人で使いたいので一旦true
            await zoushigaya(month, '01', roomids, true);
            const lineMessages = []
            roomids.forEach(roomId => {
              const filePath = `screenshots/zoushigaya/${roomId}_${month}.png`
              if (fs.existsSync(filePath)) {
                const url = `https://bashotori-bot.haruhiko.work/-image/zoushigaya/${roomId}_${month}.png`
                lineMessages.push(
                  {
                    type: 'image',
                    originalContentUrl: url,
                    previewImageUrl: url
                  }
                )
              }
              else {
                lineMessages.push(
                  {
                    type: "text",
                    text: `${roomId} の空きはありませんでした。\n(07:音楽室, 10:多目的ホール, 13:第1練習室, 14: 第2練習室)`
                  }
                )
              }
            })
            lineMessages.push(
              {
                type: "text",
                text: `${message}-end`
              },
            )
            await lineBot.replyMessage(event.replyToken, lineMessages)
          }
          // replyMessage()で返信し、そのプロミスをevents_processedに追加。
          events_processed.push(pushImage());
        }
      }
    }
  });

  // すべてのイベント処理が終了したら何個のイベントが処理されたか出力。
  const response = await Promise.all(events_processed)
  console.log(`${response.length} event(s) processed.`)
})

export default router;
