import Statment from "../apps/Statments";
import Api from "../apps/api";
import express from 'express';
const router = express.Router();

router.get('/echo', (req, res) => {
  const message = { message: 'success' };
  const resultBase64 = Buffer.from(JSON.stringify(message)).toString('base64');
  console.log('connected');
  res.send(resultBase64);
});

router.post('/login', async (req, res) => {
  try {
    const sessionId = await Api.login(req.body.authorization);
    res.send({ session: sessionId });
  } catch (error) {
    console.error('Login error', error);
    res.status(500).send(error);
  }
});

router.post('/qurry', async (req, res) => {
  try {
    const decoded = Buffer.from(req.body.hash, 'base64').toString();
    const parseData = JSON.parse(decoded);
    const { from, select, where } = parseData.data;
    const result = await Api.query(from, select, where, parseData.token.session);
    const resultBase64 = Buffer.from(JSON.stringify(result)).toString('base64');
    res.send(resultBase64);
  } catch (error) {
    console.error('Error handling request', error);
    res.status(500).send(error);
  }
});

router.post('/statment', async (req, res) => {
  try {
    const decoded = Buffer.from(req.body.hash, 'base64').toString();
    const parseData = JSON.parse(decoded);
    const { ac, from, to } = parseData.data;
    const stm = new Statment(parseData.token.session);
    const rawResult = await stm.get(ac, from, to);
    const resultBase64 = Buffer.from(JSON.stringify(rawResult)).toString('base64');
    res.send(resultBase64);
  } catch (error) {
    console.error('Error handling request', error);
    res.status(500).send(error);
  }
});
export default router

