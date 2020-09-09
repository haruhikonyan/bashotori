import * as Express from 'express';

import zoushigaya from "../scraping/zoushigaya"
import kotoKu from "../scraping/koto-ku"
import sumidaKu from "../scraping/sumida-ku"

const router = Express.Router();

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

export default router;
