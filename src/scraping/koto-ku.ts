import * as puppeteer from 'puppeteer';

const get = async (month: string, day: string) => {
  console.log(`${month}月 Koto-ku start`)

  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const page = await browser.newPage();
  
  
  const url = 'https://sisetun.kcf.or.jp/web/'
  await page.goto(url, { waitUntil: 'networkidle0' });

  // 施設の空き状況
  let loadPromise = page.waitForNavigation();
  // @ts-ignore
  await page.evaluate(() => doAction(((_dom == 3) ? document.layers['disp'].document.formWTransInstSrchVacantAction : document.formWTransInstSrchVacantAction ), gRsvWTransInstSrchVacantAction))
  await loadPromise;

  // 検索メニュー
  loadPromise = page.waitForNavigation();
  // @ts-ignore
  await page.evaluate(() => doAction((_dom == 3) ? document.layers['disp'].document.formWTransInstSrchMultipleAction : document.formWTransInstSrchMultipleAction, gRsvWTransInstSrchMultipleAction))
  await loadPromise;

  // 利用目的
  loadPromise = page.waitForNavigation();
  // @ts-ignore
  await page.evaluate(() => sendSelectWeekNum((_dom == 3) ? document.layers['disp'].document.formWTransInstSrchMultipleAction : document.formWTransInstSrchMultipleAction, gRsvWTransInstSrchPpsAction))
  await loadPromise;

  // オーケストラ・楽団
  loadPromise = page.waitForNavigation();
  // @ts-ignore
  await page.evaluate(() => sendPpsCd((_dom == 3) ? document.layers['disp'].document.formWTransInstSrchMultipleAction : document.formWTransInstSrchMultipleAction, gRsvWTransInstSrchMultipleAction, '120' , '12020'))
  await loadPromise;

  // 年月日
  loadPromise = page.waitForNavigation();
  // @ts-ignore
  await page.evaluate(() => sendSelectWeekNum((_dom == 3) ? document.layers['disp'].document.formWTransInstSrchMultipleAction : document.formWTransInstSrchMultipleAction, gRsvWTransInstSrchSetDayAction))
  await loadPromise;

  // 開始年月日 選択
  // @ts-ignore
  await page.evaluate((month, day) => changeDayGif((_dom == 3) ? document.layers['disp'].document.CalendarDays16 : document.CalendarDays16, 2021, month, day), month, day)

  // 年月日設定
  loadPromise = page.waitForNavigation();
  // @ts-ignore
  await page.evaluate(() => sendSelectDay((_dom == 3) ? document.layers['disp'].document.formCommonSrchDayWeekAction : document.formCommonSrchDayWeekAction, gRsvWTransInstSrchMultipleAction, 1))
  await loadPromise;

  // 土 日 祝 選択
  await page.evaluate(() => { 
    // @ts-ignore
    changeWeekGif((_dom == 3) ? document.layers['disp'].document.weektype5 : document.weektype5, 5)
    // @ts-ignore
    changeWeekGif((_dom == 3) ? document.layers['disp'].document.weektype6 : document.weektype6, 6)
    // @ts-ignore
    changeWeekGif((_dom == 3) ? document.layers['disp'].document.weektype7 : document.weektype7, 7)
  })

  // 検索開始
  loadPromise = page.waitForNavigation();
  // @ts-ignore
  await page.evaluate(() => sendSelectWeekNum((_dom == 3) ? document.layers['disp'].document.formWTransInstSrchMultipleAction : document.formWTransInstSrchMultipleAction, gRsvWGetInstSrchInfAction))
  await loadPromise;

  // 江東区文化センターホール
  await page.screenshot({ path: `screenshots/koto-ku/${month}_${day}_99.png`, fullPage: true });



  for (let i = 1; i < 20; ++i) {
    // 次の施設へループ
    loadPromise = page.waitForNavigation();
    // @ts-ignore
    await page.evaluate(() => doTransInstSrchVacantTzoneAction((_dom == 3) ? document.layers['disp'].document.formWTransInstSrchVacantTzoneAction : document.formWTransInstSrchVacantTzoneAction, gRsvWTransInstSrchVacantAction, 6, gSrchSelectInstNo, gSrchSelectInstMax))
    await loadPromise;
  
    await page.screenshot({ path: `screenshots/koto-ku/${month}_${day}_${i}.png`, fullPage: true });
  }


  await browser.close();
  console.log('koto-ku end')
}

export default get;
