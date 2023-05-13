class Connection {
        constructor(
        token = this.token
    )

    async conn(select,from,where) {
        const url =
        "https://agentbanking.standardbankbd.com/agentbank_v2/includes/call_list.php"
        if (!token) return "Error: Token Not Found"
        const cookies = [`PHPSESSID=${token}`]
        // Create a cookie header with the PHPSESSID value
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

module.exports = Connection