import * as puppeteer from 'puppeteer';
import * as fs from 'fs';

const get = async (month: string, day: string, roomIds: string[], isLoginMode: boolean) => {
  console.log(`${month}月 Zousigaya start`)

  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const page = await browser.newPage();
  
  
  const url = 'https://www2.pf489.com/toshima/Web/Wg_KoukyouShisetsuYoyakuMoushikomi.aspx'
  await page.goto(url, { waitUntil: 'networkidle0' });

  // ログインページへ
  let loadPromise
  if (isLoginMode) {
  loadPromise = page.waitForNavigation();
  await page.click('#rbtnLogin')
  await loadPromise;

  // ログイン
  loadPromise = page.waitForNavigation();
  await page.type('#txtID', process.env.ZOUSHIGAYA_ID);
  await page.type('#txtPass', process.env.ZOUSHIGAYA_PASS);

  await page.click('#ucPCFooter_pnlNextBtn')
  await loadPromise;
  }

  // 雑司が谷文化
  loadPromise = page.waitForNavigation();
  await page.click('#dlSSCategory_ctl03_btnSSCategory')
  await loadPromise;

  loadPromise = page.waitForNavigation();
  await page.click('#dgShisetsuList_ctl04_chkSelectLeft')
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

  for (const roomId of roomIds) {
    console.log(`roomId: ${roomId} start`)
    // 更新ボタンを押す
    loadPromise = page.waitForNavigation();
    await page.click('#btnUpdate');
    await loadPromise;

    let freeCount = 0;

    // 0埋めしてチェックループ
    for (const day of days.map(d => ( '0' + d ).slice( -2 ))) {
      try {
        const targetId = `#dlRepeat_ctl00_tpItem_dgTable_ctl${roomId}_b2021${month}${day}`
        // × だったらスキップする
        const targetElement = await page.$(targetId)
        const status = await targetElement.getProperty('textContent')
        const statusString = await status.jsonValue() as string
        if (statusString.includes('×')) { continue }
        
        // 最大20個までしかチェックができない
        await targetElement.click();
        freeCount++
      } catch (error) {
        console.log('skip:', error)
      }
    }

    const filePath = `screenshots/zoushigaya/${roomId}_${month}.png`
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
    console.log(`roomId: ${roomId} end`)

    // 戻る
    loadPromise = page.waitForNavigation();
    await page.click('#ucPCFooter_btnBack');
    await loadPromise;
    
  }

  await browser.close();
  console.log('Zousigaya end')
}

export default get;
