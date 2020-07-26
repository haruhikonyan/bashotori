import * as puppeteer from 'puppeteer';
import * as fs from 'fs';

const get = async (month: string, day: string) => {
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
  // 社会福祉会館
  await page.click('#dgShisetsuList_ctl02_chkSelectLeft')
  // みどりコミュニティセンター
  await page.click('#dgShisetsuList_ctl05_chkSelectLeft')
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

  const placeIdObject = {
    shakaifukushi: {
      placeId: '00',
      roomIds: ['02', '03', '04', '05', '06', '07']
    },
    midori: {
      placeId: '01',
      roomIds: ['05', '06', '07']
    },
  }
  const placeList = ['shakaifukushi', 'midori']
  for (const place of placeList) {
    console.log(`${place} check start`)
    // 更新ボタンを押す
    loadPromise = page.waitForNavigation();
    await page.click('#btnUpdate');
    await loadPromise;

    let freeCount = 0;

    // 0埋めしてチェックループ
    for (const day of days.map(d => ( '0' + d ).slice( -2 ))) {
      for (const roomId of placeIdObject[place].roomIds) {
        try {
          const targetId = `#dlRepeat_ctl${placeIdObject[place].placeId}_tpItem_dgTable_ctl${roomId}_b2020${month}${day}`
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
      
    const filePath = `screenshots/sumida-ku/${place}_${month}.png`
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
