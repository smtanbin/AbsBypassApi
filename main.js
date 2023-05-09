const express = require("express")
// const bodyParser = require("body-parser")
const Api = require("./api")
const app = express()
const port = 3000

app.use(express.json())
// app.use(bodyParser.json({ limit: "50mb" }))
// app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }))
// Set the CORS headers
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization")
  next()
})

// app.use("*", (req, res, next) => {
//   console.log(`Request: ${req.method} ${req.originalUrl}`)
//   console.log()
//   console.log(`Headers: ${JSON.stringify(req.headers)}`)
//   console.log()
//   console.log(`Body: ${JSON.stringify(req.body)}`)
//   next()
// })

app.get("/", (req, res) => {
  const date = new Date()
  res.send(`Server Time: ${date}`)
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
    const decoded = Buffer.from(req.data, "base64").toString()
    const [path, token, data] = JSON.parse(decoded)
    switch (path) {
      case "/query":
        const { from, select, where } = data
        const result = await Api.query(from, select, where, token)
        const resultBase64 = Buffer.from(result).toString("base64") // Encode the result as Base64
        res.send(resultBase64)
        break
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

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
