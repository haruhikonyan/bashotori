import * as puppeteer from 'puppeteer';
 

const test = async () => {
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const page = await browser.newPage();
  
  
  const url = 'https://www2.pf489.com/toshima/Web/Wg_KoukyouShisetsuYoyakuMoushikomi.aspx'
  await page.goto(url, { waitUntil: 'networkidle0' });

  // ログインページへ
  let loadPromise = page.waitForNavigation();
  await page.click('#rbtnLogin')
  await loadPromise;

  // ログイン
  loadPromise = page.waitForNavigation();
  await page.type('#txtID', process.env.ZOUSHIGAYA_ID);
  await page.type('#txtPass', process.env.ZOUSHIGAYA_PASS);

  await page.click('#ucPCFooter_pnlNextBtn')
  await loadPromise;

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
  await page.click('#ucPCFooter_btnForward');
  await loadPromise;


  const days = []
  for (let i = 0; i < 15; ++i) {
    const dayElement = await page.$(`#dlRepeat_ctl00_tpItem_dgTable > tbody > tr.TitleColor > td:nth-child(${i + 3})`)
    if (!dayElement) { break }
    const day = await dayElement.getProperty('textContent')
    days.push(((await day.jsonValue()) as string).slice( 0, -1 ))
  }

  // 多目的、音楽室、第1、第2
  // const roomIds = ['07', '10', '13', '14']
  const roomIds = ['13', '14']
  // TODO もっと上で宣言して月選択に含む
  const month = '06'

  for (const roomId of roomIds) {
    // 0埋め
    for (const day of days.map(d => ( '0' + d ).slice( -2 ))) {
      await page.click(`#dlRepeat_ctl00_tpItem_dgTable_ctl${roomId}_b2020${month}${day}`);
    }
  }
  loadPromise = page.waitForNavigation();
  await page.click('#ucPCFooter_btnForward');
  await loadPromise;
  

  await page.screenshot({ path: 'screenshots/zoushigaya/home1.png', fullPage: true });

  // await page.title() でも良い
  const title = await page.$eval('head > title', e => e.textContent);
  console.log(title)

  await browser.close();
  console.log('end')
}
export default test;