import axios from "axios";
import qs from "qs";

async function testVariant1() {
  console.log("\n--- Variant 1: urlencoded ---");
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
    console.log("V1 SUCCESS:", res.status, res.data);
  } catch (err) {
    console.log("V1 ERROR:", err.response ? err.response.status : err.message, err.response ? err.response.data : "");
  }
}

async function testVariant2() {
  console.log("\n--- Variant 2: raw json ---");
  const url = "https://export.in.aramex.net/webapi_v2.0/api/CSB/GetCSBToken";
  const body = {
    username: "test.api@aramex.com",
    password: "Aramex@12345",
    grant_type: "password"
  };

  try {
    const res = await axios.post(url, body, {
      headers: { "Content-Type": "application/json" }
    });
    console.log("V2 SUCCESS:", res.status, res.data);
  } catch (err) {
    console.log("V2 ERROR:", err.response ? err.response.status : err.message, err.response ? err.response.data : "");
  }
}

async function testVariant3() {
  console.log("\n--- Variant 3: Basic Auth Header ---");
  const url = "https://export.in.aramex.net/webapi_v2.0/api/CSB/GetCSBToken";
  const body = qs.stringify({
    grant_type: "password",
    username: "test.api@aramex.com",
    password: "Aramex@12345"
  });

  const auth = Buffer.from("test.api@aramex.com:Aramex@12345").toString("base64");

  try {
    const res = await axios.post(url, body, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${auth}`
      }
    });
    console.log("V3 SUCCESS:", res.status, res.data);
  } catch (err) {
    console.log("V3 ERROR:", err.response ? err.response.status : err.message, err.response ? err.response.data : "");
  }
}

async function run() {
  await testVariant1();
  await testVariant2();
  await testVariant3();
}

run();
