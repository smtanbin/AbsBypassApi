import request from "request";

class Connection {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  async conn(select: string, from: string, where: string): Promise<any> {
    const url =
      "https://agentbanking.standardbankbd.com/agentbank_v2/includes/call_list.php";
    if (!this.token) return "Error: Token Not Found";
    const cookies = [`PHPSESSID=${this.token}`];
    // Create a cookie header with the PHPSESSID value
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
    };

    try {
      return await new Promise((resolve, reject) => {
        // Send the request and handle the response
        request.post(options, (err, httpResponse, body) => {
          if (err) {
            console.error("Error sending query request", err);
            reject(err);
          } else {
            resolve(body);
          }
        });
      });
    } catch (err) {
      console.error("Error Making Post", err);
      throw new Error("Error Making Post"+ err);
    }
  }
}

export default Connection;
