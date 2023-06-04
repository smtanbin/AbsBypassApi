import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import Api from "./apps/api";
import Statment from "./apps/Statments";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Set the CORS headers
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  next();
});

app.use("*", (req: Request, res: Response, next: NextFunction) => {
  console.log(`BaseUrl:${req.baseUrl}, Payload: ${JSON.stringify(req.body)}`);
  next();
});

app.get("/", (req: Request, res: Response) => {
  const date = new Date();
  res.send(`Server Time: ${date}`);
});

app.get("/echo", (req: Request, res: Response) => {
  const message = { message: "success" };
  const resultBase64 = Buffer.from(JSON.stringify(message)).toString("base64");
  console.log("connected");
  res.send(resultBase64);
});

// Define the Express routes
app.post("/login", async (req: Request, res: Response) => {
  try {
    const sessionId = await Api.login(req.body.authorization);
    res.send({ session: sessionId });
  } catch (error) {
    console.error("Login error", error);
    res.status(500).send(error);
  }
});


app.post("/qurry", async (req: Request, res: Response) => {
  try {
    const decoded = Buffer.from(req.body.hash, "base64").toString();
    const parseData = JSON.parse(decoded);
    const { from, select, where } = parseData.data;
    const result = await Api.query(from, select, where, parseData.token.session);
    const resultBase64 = Buffer.from(JSON.stringify(result)).toString("base64");
        res.send(resultBase64);
  } catch (error) {
    console.error("Error handling request", error);
    res.status(500).send(error);
  }
});

app.post("/statment", async (req: Request, res: Response) => {
  try {
    const decoded = Buffer.from(req.body.hash, "base64").toString();
    const parseData = JSON.parse(decoded);
        const { ac, from, to } = parseData.data;
        const stm = new Statment(parseData.token.session);
        const rawResult = await stm.get(ac, from, to);
        const resultBase64 = Buffer.from(JSON.stringify(rawResult)).toString("base64");
        res.send(resultBase64);
  } catch (error) {
    console.error("Error handling request", error);
    res.status(500).send(error);
  }
});

app.use("*", (req: Request, res: Response) => {
  res.status(404).send("Path Not Found");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
