import axios from "axios";

const clientInfo = {
  UserName: "test.api@aramex.com",
  Password: "Aramex@12345",
  Version: "v1.0",
  AccountNumber: "60531487",
  AccountPin: "654654",
  AccountEntity: "BOM",
  AccountCountryCode: "IN",
  Source: 24
};

const transaction = {
  Reference1: "",
  Reference2: "",
  Reference3: "",
  Reference4: "",
  Reference5: ""
};

// 1. Track Shipment
async function testTrackShipment() {
  console.log("\n--- Testing 1. Track Shipment ---");
  const url = "https://ws.aramex.net/ShippingAPI.V2/Tracking/Service_1_0.svc/json/TrackShipments";
  const payload = {
    ClientInfo: clientInfo,
    GetLastTrackingUpdateOnly: false,
    Shipments: ["37338099901"],
    Transaction: transaction
  };

  try {
    const res = await axios.post(url, payload, { headers: { "Content-Type": "application/json", "Accept": "application/json" } });
    console.log("TrackShipment STATUS:", res.status);
    console.log("TrackShipment RESPONSE:", JSON.stringify(res.data, null, 2).slice(0, 300));
  } catch (err) {
    console.log("TrackShipment ERROR:", err.response ? err.response.data : err.message);
  }
}

// 2. Rate Calculator
async function testRateCalculator() {
  console.log("\n--- Testing 2. Rate Calculator ---");
  const url = "https://ws.aramex.net/ShippingAPI.V2/RateCalculator/Service_1_0.svc/json/CalculateRate";
  const payload = {
    ClientInfo: clientInfo,
    OriginAddress: {
      Line1: "Mumbai Address",
      Line2: "",
      Line3: "",
      City: "Mumbai",
      StateOrProvinceCode: "MH",
      PostCode: "400093",
      CountryCode: "IN"
    },
    DestinationAddress: {
      Line1: "Dubai Address",
      Line2: "",
      Line3: "",
      City: "Dubai",
      StateOrProvinceCode: "",
      PostCode: "",
      CountryCode: "AE"
    },
    ShipmentDetails: {
      Dimensions: {
        Length: 30,
        Width: 30,
        Height: 30,
        Unit: "cm"
      },
      ActualWeight: {
        Unit: "KG",
        Value: 1.4
      },
      ChargeableWeight: {
        Unit: "KG",
        Value: 1.4
      },
      DescriptionOfGoods: "Books & Clothing",
      GoodsOriginCountry: "IN",
      NumberOfPieces: 1,
      ProductGroup: "EXP",
      ProductType: "PPX",
      PaymentType: "P",
      PaymentOptions: "",
      CustomsValueAmount: {
        CurrencyCode: "USD",
        Value: 100
      }
    },
    Transaction: transaction
  };

  try {
    const res = await axios.post(url, payload, { headers: { "Content-Type": "application/json", "Accept": "application/json" } });
    console.log("CalculateRate STATUS:", res.status);
    console.log("CalculateRate RESPONSE:", JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.log("CalculateRate ERROR:", err.response ? err.response.data : err.message);
  }
}

// 3. Hold Shipment
async function testHoldShipments() {
  console.log("\n--- Testing 3. Hold Shipments ---");
  const url = "https://ws.aramex.net/ShippingAPI.V2/Shipping/Service_1_0.svc/json/HoldShipments";
  const payload = {
    ClientInfo: clientInfo,
    Shipments: [
      {
        ShipmentNumber: "37338099901",
        HoldReason: "Customer Request",
        Comments: "Hold parcel at origin hub"
      }
    ],
    Transaction: transaction
  };

  try {
    const res = await axios.post(url, payload, { headers: { "Content-Type": "application/json", "Accept": "application/json" } });
    console.log("HoldShipments STATUS:", res.status);
    console.log("HoldShipments RESPONSE:", JSON.stringify(res.data, null, 2).slice(0, 300));
  } catch (err) {
    console.log("HoldShipments ERROR:", err.response ? (typeof err.response.data === 'string' ? err.response.data.slice(0, 300) : err.response.data) : err.message);
  }
}

async function runAll() {
  await testTrackShipment();
  await testRateCalculator();
  await testHoldShipments();
}

runAll();
