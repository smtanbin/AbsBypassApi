import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import Api from "./apps/api";
import Statment from "./apps/Statments";
import router from "./router/old";
import newRouter from "./router/new";

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

app.use('/', router);
app.use('/v2', newRouter);

app.use("*", (req: Request, res: Response) => {
  res.status(404).send("Path Not Found");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
