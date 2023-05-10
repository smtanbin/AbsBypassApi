// Define the LoginService class
const request = require("request")

class Api {
  static login(data) {
    const decoded = Buffer.from(data, "base64").toString()
    // console.log("Log/login: decoded variable />", decoded)
    const auth = decoded.split(":")
    const url =
      "https://agentbanking.standardbankbd.com/agentbank_v2/includes/login_check.php"
    const _username = auth[0]
    const _password = auth[1]

    // Create a POST request with username and password
    const options = {
      url: url,
      method: "POST",
      form: {
        userid: _username,
        password: _password,
      },
    }

    // console.log("Log: Auth Options />", options)

    // return "g477d8s635g39tguci7j101463"
    return new Promise((resolve, reject) => {
      // Send the request and handle the response
      try {
        request.post(options, (err, httpResponse, body) => {
          if (err) {
            console.error("Error sending login request", err)
            reject(err)
          } else if (body !== "Success") {
            console.error("Body:", httpResponse.body)
            reject(httpResponse.body)
          } else {
            const cookies = httpResponse.headers["set-cookie"]
            const sessionIdCookie = cookies.find((cookie) =>
              cookie.includes("PHPSESSID")
            )
            const sessionId = sessionIdCookie.split("=")[1].split(";")[0]
            resolve(sessionId)
          }
        })
      } catch (err) {
        console.error("Error: Getting Cookie, Error />", err)
        throw new Error("Error Getting Cookie", err)
      }
    })
  }

  // Define the QueryService

  static async query(from, select, where, token) {
    const url =
      "https://agentbanking.standardbankbd.com/agentbank_v2/includes/call_list.php"

    // console.log(`from: ${from},token:${token}`)

    if (!token) return "Error: Token Not Found"

    const cookies = [`PHPSESSID=${token}`] // Create a cookie header with the PHPSESSID value

    // Create a POST request with the query parameters
    const options = {
      url: url,
      method: "POST",
      headers: {
        Cookie: cookies.join(";"), // Add the cookie header to the request headers
      },
      form: {
        table_name: from,
        column_name: select,
        condition: `and ${where}`,
      },
    }
    console.log("---------->>options", options)

    try {
      return await new Promise((resolve, reject) => {
        // Send the request and handle the response
        request.post(options, (err, httpResponse, body) => {
          if (err) {
            console.error("Error sending query request", err)
            reject(err)
          } else {
            resolve(body)
          }
        })
      })
    } catch (err_1) {
      console.error("Error Macking Post", err_1)
      throw new Error("Error Macking Post", err_1)
    }
  }
}

module.exports = Api
