import * as Express from 'express';

import main from "../scraping/zoushigaya"

const router = Express.Router();

router.get('/', async (req, res) => {
  res.render("index", {message: 'message'});
})

router.get('/zoushigaya', async (req, res) => {
  const month = req.query.month as string
  if (month) {
    await main(month, '01');
  }
  res.render("zoushigaya/index", { month });
})

export default router;
