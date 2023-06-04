import request from "request";

class Api {
  static login(data: string): Promise<string> {
    const decoded = Buffer.from(data, "base64").toString();
    const auth = decoded.split(":");
    const url = "https://agentbanking.standardbankbd.com/agentbank_v2/includes/login_check.php";
    const _username = auth[0];
    const _password = auth[1];

    const options = {
      url: url,
      method: "POST",
      form: {
        userid: _username,
        password: _password,
      },
    };

    return new Promise((resolve, reject) => {
      try {
        request.post(options, (err, httpResponse, body) => {
          if (err) {
            console.error("Error sending login request", err);
            reject(err);
          } else if (body !== "Success") {
            console.error("Body:", httpResponse.body);
            reject(httpResponse.body);
          } else {
            const cookies:any = httpResponse.headers["set-cookie"];
            const sessionIdCookie = cookies.find((cookie: string) => cookie.includes("PHPSESSID"));
            const sessionId = sessionIdCookie.split("=")[1].split(";")[0];
            resolve(sessionId);
          }
        });
      } catch (err) {
        console.error("Error: Getting Cookie, Error />", err);
        throw new Error("Error Getting Cookie"+ err);
      }
    });
  }

  static async query(from: string, select: string, where: string, token: string): Promise<string> {
    const url = "https://agentbanking.standardbankbd.com/agentbank_v2/includes/call_list.php";

    if (!token) return "Error: Token Not Found";

    const cookies = [`PHPSESSID=${token}`];

    const options = {
      url: url,
      method: "POST",
      headers: {
        Cookie: cookies.join(";"),
      },
      form: {
        table_name: from,
        column_name: select,
        condition: `and ${where}`,
      },
    };

    try {
      return await new Promise((resolve, reject) => {
        request.post(options, (err, httpResponse, body) => {
          if (err) {
            console.error("Error sending query request", err);
            reject(err);
          } else {
            resolve(body);
          }
        });
      });
    } catch (err:any) {
      console.error("Error Macking Post", err);
      throw new Error("Error Macking Post" + err);
    }
  }
}

export default Api;
