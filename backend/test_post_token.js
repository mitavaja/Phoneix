import axios from "axios";
import qs from "qs";

async function testPostToken() {
  const url = "https://export.in.aramex.net/webapi_v2.0/api/CSB/GetCSBToken";
  const body = qs.stringify({
    username: "test.api@aramex.com",
    password: "Aramex@12345",
    grant_type: "password"
  });

  try {
    const res = await axios.post(url, body, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });
    console.log("POST SUCCESS! Status:", res.status);
    console.log("Response:", JSON.stringify(res.data, null, 2));
  } catch (err) {
    if (err.response) {
      console.log("POST ERROR Status:", err.response.status);
      console.log("POST ERROR Data:", err.response.data);
    } else {
      console.log("ERROR:", err.message);
    }
  }
}

testPostToken();
