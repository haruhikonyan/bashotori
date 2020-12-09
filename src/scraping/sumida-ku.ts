import * as puppeteer from 'puppeteer';
import * as fs from 'fs';

const buildings = {
  shakai: {
    id: '#dgShisetsuList_ctl02_chkSelectLeft',
    name: '社会福祉会館',
    order: 1,
    roomIds: ['02', '03', '04', '05', '06', '07'],
  },
  hikifine: {
    id: '#dgShisetsuList_ctl04_chkSelectRight',
    name: '曳舟文化センター',
    order: 2,
    roomIds: ['02', '03', '07', '08', '09'],
  },
  midori: {
    id: '#dgShisetsuList_ctl05_chkSelectLeft',
    name: 'みどりコミュニティセンター',
    order: 3,
    roomIds: ['05', '06', '07'],
  },
}

const get = async (month: string, day: string, buildingkeys: string[]) => {
  console.log(`${month}月 Sumida start`)

  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const page = await browser.newPage();
  
  
  const url = 'http://yoyaku02.city.sumida.lg.jp/Web/'
  await page.goto(url, { waitUntil: 'networkidle0' });

  // 多目的施設
  let loadPromise = page.waitForNavigation();
  await page.click('#dlSSCategory_ctl00_btnSSCategory')
  await loadPromise;

  // 施設選択
  loadPromise = page.waitForNavigation();
  for (const key of buildingkeys) {
    await page.click(buildings[key].id)
  }
  await page.click('#ucPCFooter_btnForward');
  await loadPromise;
  
  // 日時選択
  loadPromise = page.waitForNavigation();
  await page.click('#rbtnMonth');
  await page.click('#chkSat');
  await page.click('#chkSun');
  await page.click('#chkHol');
  
  await page.$eval('#txtMonth',  (element, month) => (element as HTMLInputElement).value = month, month);
  await page.$eval('#txtDay', (element, day) => (element as HTMLInputElement).value = day, day);
  await page.click('#ucPCFooter_btnForward');
  await loadPromise;

  const days = []
  for (let i = 0; i < 15; ++i) {
    const dayElement = await page.$(`#dlRepeat_ctl00_tpItem_dgTable > tbody > tr.TitleColor > td:nth-child(${i + 3})`)
    if (!dayElement) { break }
    const day = await dayElement.getProperty('textContent')
    days.push(((await day.jsonValue()) as string).slice( 0, -1 ))
  }

  for (let buildingOrder = 0; buildingOrder < buildingkeys.length; ++buildingOrder) {
    const key = buildingkeys[buildingOrder]
    console.log(`${key} check start`)
    // 更新ボタンを押す
    loadPromise = page.waitForNavigation();
    await page.click('#btnUpdate');
    await loadPromise;

    let freeCount = 0;

    // 0埋めしてチェックループ
    for (const day of days.map(d => ( '0' + d ).slice( -2 ))) {
      // TODO: index とかそのへん怪しい
      for (const roomId of buildings[key].roomIds) {
        try {
          // 施設ごと上から順番に数字が振られる TODO: order 使ってどうにかしたい
          const targetId = `#dlRepeat_ctl0${buildingOrder}_tpItem_dgTable_ctl${roomId}_b2021${month}${day}`
          // dlRepeat_ctl00_tpItem_dgTable_ctl02_b20211003
          // dlRepeat_ctl02_tpItem_dgTable_ctl0_b2021101
          console.log(roomId)
          console.log(buildingOrder)
          console.log(targetId)
          // × だったらスキップする
          const targetElement = await page.$(targetId)
          const status = await targetElement.getProperty('textContent')
          const statusString = await status.jsonValue() as string
          if (statusString.includes('×')) { continue }

          await targetElement.click();
          freeCount++
        } catch (error) {
          console.log('skip:', error)
        }
      }
    }
      
    const filePath = `screenshots/sumida-ku/${key}_${month}.png`

    // 空いている部屋がなければスクショがあれば消してループを抜ける
    if (freeCount === 0) {
      if (fs.existsSync(filePath)) {
        // あれば削除
        fs.unlinkSync(filePath);
      }
      continue;
    }
    // 空き情報確認
    loadPromise = page.waitForNavigation();
    await page.click('#ucPCFooter_btnForward');
    await loadPromise;

    await page.screenshot({ path: filePath, fullPage: true });

    // 戻る
    loadPromise = page.waitForNavigation();
    await page.click('#ucPCFooter_btnBack');
    await loadPromise;
  }

  await browser.close();
  console.log('Sumida end')
}

export default get;
