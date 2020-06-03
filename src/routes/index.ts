import * as Express from 'express';

import main from "../scraping/zoushigaya"

const router = Express.Router();

router.get('/', async (req, res) => {
    res.render("index", {message: 'message'});
  })

router.get('/zoushigaya', async (req, res) => {
    await main();
    res.render("zoushigaya/index");
  })

export default router;