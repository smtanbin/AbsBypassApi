const request = require("request")

class Connection {
  constructor(token) {
    this.token = token
  }

  async get(select, from, where) {
    const url =
      "https://agentbanking.standardbankbd.com/agentbank_v2/includes/call_list.php"

    if (!this.token) {
      throw new Error("Error: Token Not Found")
    }

    const cookies = [`PHPSESSID=${this.token}`]
    const options = {
      url: url,
      method: "POST",
      headers: {
        Cookie: cookies.join(";"),
      },
      form: {
        table_name: from,
        column_name: select,
        condition: `and ${where}`.replace(/'/g, "\\'"),
      },
    }

    console.log("Connection options />", options)

    const response = await request.post(options)

    console.log("Connection response />", response)

    if (response.statusCode !== 200) {
      throw new Error(`Error getting data: ${response.statusCode}`)
    }

    return response.body
  }
}

module.exports = Connection
