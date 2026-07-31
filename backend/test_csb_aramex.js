import axios from "axios";

// 1. Token CSB V Commodity & Shipping Bill
async function testGetCSBToken() {
  console.log("\n--- Testing Token CSB V Commodity & Shipping Bill ---");
  const url = "https://export.in.aramex.net/webapi_v2.0/api/CSB/GetCSBToken";
  const payload = {
    username: "test.api@aramex.com",
    password: "Aramex@12345",
    grant_type: "password"
  };

  try {
    const res = await axios.post(url, payload, { headers: { "Content-Type": "application/json" } });
    console.log("GetCSBToken STATUS:", res.status);
    console.log("GetCSBToken RESPONSE:", JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.log("GetCSBToken ERROR:", err.response ? err.response.data : err.message);
  }
}

// 2. Token Seller KYC Token
async function testGetSellerKYCToken() {
  console.log("\n--- Testing KYCStatusToken ---");
  const url = "https://export.in.aramex.net/webapi_v2.0/api/CSB/GetSellerKYCToken";
  const payload = {
    username: "test.api@aramex.com",
    password: "Aramex@12345",
    grant_type: "password"
  };

  try {
    const res = await axios.post(url, payload, { headers: { "Content-Type": "application/json" } });
    console.log("GetSellerKYCToken STATUS:", res.status);
    console.log("GetSellerKYCToken RESPONSE:", JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.log("GetSellerKYCToken ERROR:", err.response ? err.response.data : err.message);
  }
}

async function runAll() {
  await testGetCSBToken();
  await testGetSellerKYCToken();
}

runAll();
