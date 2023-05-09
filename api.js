// Define the LoginService class
const request = require("request")

class Api {
  static login(data) {
    const decoded = Buffer.from(data, "base64").toString()
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
    console.log(options)
    return new Promise((resolve, reject) => {
      // Send the request and handle the response
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
    })
  }

  // Define the QueryService

  static query(from, select, where, token) {
    const url =
      "https://agentbanking.standardbankbd.com/agentbank_v2/includes/call_list.php"
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

    return new Promise((resolve, reject) => {
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
  }
}

module.exports = Api
