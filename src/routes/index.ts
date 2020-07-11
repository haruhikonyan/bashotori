import * as Express from 'express';

import main from "../scraping/zoushigaya"

const router = Express.Router();

router.get('/', async (req, res) => {
  res.render("index", {message: 'message'});
})

router.get('/zoushigaya', async (req, res) => {
  const month = req.query.month as string
  // TODO: まともなエラーハンドリング
  let error = null;
  if (month) {
    try {
      await main(month, '01');
    } catch (e) {
      error = e
    }
  }
  res.render("zoushigaya/index", { month, error});
})

export default router;
