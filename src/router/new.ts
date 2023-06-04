import crypto from 'crypto';
import Statment from "../apps/Statments";
import Api from "../apps/api";
import express from 'express';
import getKey from '../key';

const newRouter = express.Router();
const privateKey = getKey()

newRouter.get('/echo', (req, res) => {
  const message = { message: 'success' };
  const encryptedData = crypto.privateEncrypt(privateKey, Buffer.from(JSON.stringify(message)));
  const resultRSA = encryptedData.toString('base64');
  console.log('connected');
  res.send(resultRSA);
});

newRouter.post('/login', async (req, res) => {
  try {
    const sessionId = await Api.login(req.body.authorization);
    const encryptedData = crypto.privateEncrypt(privateKey, Buffer.from(JSON.stringify({ session: sessionId })));
    const resultRSA = encryptedData.toString('base64');
    res.send(resultRSA);
  } catch (error) {
    console.error('Login error', error);
    res.status(500).send(error);
  }
});

newRouter.post('/qurry', async (req, res) => {
  try {
    const decryptedData = crypto.privateDecrypt(privateKey, Buffer.from(req.body.hash, 'base64'));
    const parseData = JSON.parse(decryptedData.toString());
    const { from, select, where } = parseData.data;
    const result = await Api.query(from, select, where, parseData.token.session);
    const encryptedData = crypto.privateEncrypt(privateKey, Buffer.from(JSON.stringify(result)));
    const resultRSA = encryptedData.toString('base64');
    res.send(resultRSA);
  } catch (error) {
    console.error('Error handling request', error);
    res.status(500).send(error);
  }
});

newRouter.post('/statment', async (req, res) => {
  try {
    const decryptedData = crypto.privateDecrypt(privateKey, Buffer.from(req.body.hash, 'base64'));
    const parseData = JSON.parse(decryptedData.toString());
    const { ac, from, to } = parseData.data;
    const stm = new Statment(parseData.token.session);
    const rawResult = await stm.get(ac, from, to);
    const encryptedData = crypto.privateEncrypt(privateKey, Buffer.from(JSON.stringify(rawResult)));
    const resultRSA = encryptedData.toString('base64');
    res.send(resultRSA);
  } catch (error) {
    console.error('Error handling request', error);
    res.status(500).send(error);
  }
});

export default newRouter;
