const express = require("express")
const Statement = require("./src/Stantment")
// const bodyParser = require("body-parser")
const Api = require("./api")
const app = express()
const port = 8080
const cors = require("cors")

const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors(corsOptions))
app.use(express.json())
// app.use(bodyParser.json({ limit: "50mb" }))
// app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }))
// Set the CORS headers
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
  // res.header("Access-Control-Allow-Headers", "Content-Type, Authorization")
  next()
})

// app.use("*", (req, res, next) => {
//   console.log(`BaseUrl:${req.baseUrl}, Payload: ${JSON.stringify(req.body)}`)
//   next()
// })

app.get("/", (req, res) => {
  const date = new Date()
  res.send(`Server Time: ${date}`)
})

app.get("/echo", (req, res) => {
  let massage = { massage: "success" }
  massage = JSON.stringify(massage)
  const resultBase64 = Buffer.from(massage).toString("base64")
  console.log("connected")
  res.send(resultBase64)
})

// Define the Express routes
app.post("/login", async (req, res) => {
  try {
    const sessionId = await Api.login(req.body.authorization)
    res.send({ session: sessionId })
  } catch (error) {
    console.error("Login error", error)
    res.status(500).send(error)
  }
})

app.post("/execute", async (req, res) => {
  try {
    // console.log("Log:/execute, enecoded />", req.body)
    const decoded = Buffer.from(req.body.hash, "base64").toString()
    const parseData = JSON.parse(decoded)

    // console.log("Log:/execute, decoded />", parseData)

    // console.log(`path: ${parseData.path},token:${parseData.token.session}`)

    switch (parseData.path) {
      case "/QUERY": {
        const { from, select, where } = parseData.data
        const result = await Api.query(
          from,
          select,
          where,
          parseData.token.session
        )
        console.log("Log://responce/>", result)
        const resultBase64 = Buffer.from(result).toString("base64") // Encode the result as Base64
        res.send(resultBase64)
        break
      }

      case "/STATMENT": {
        const { ac, from, to } = parseData.data
        const stm = new Statement(parseData.token.session)
        const raw_result = await stm.init(ac, from, to)
        const result = JSON.stringify(raw_result)
        const resultBase64 = Buffer.from(result).toString("base64")
        res.send(resultBase64)
        break
      }
      default:
        console.log("Request://>", decoded)
        res.status(404).send("Not Found")
        break
    }
  } catch (error) {
    console.error("Error handling request", error)
    res.status(500).send(error)
  }
})

app.post("/debuging", async (req, res) => {
  try {
    // console.log("Log:/execute, enecoded />", req.body)

    // const parseData = JSON.parse(req.body)
    const parseData = req.body

    console.log("Log:/debuging />", parseData)

    // console.log(`path: ${parseData.path},token:${parseData.token.session}`)

    switch (parseData.path) {
      case "/QUERY": {
        const { from, select, where } = parseData.data
        const result = await Api.query(
          from,
          select,
          where,
          parseData.token.session
        )
        res.send(result)
        break
      }

      case "/STATMENT": {
        const { ac, from, to } = parseData.data
        console.log(">", ac, from, to)
        const stm = new Statement(parseData.token.session)
        const raw_result = await stm.init(ac, from, to)

        const result = JSON.stringify(raw_result)
        res.send(result)
        break
      }
      default:
        res.status(404).send("Not Found")
        break
    }
  } catch (error) {
    console.error("Error handling request", error)
    res.status(500).send(error)
  }
})

app.use("*", (req, res) => {
  res.status(404).send("Path Not Found")
})

app.listen(process.env.PORT || port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
