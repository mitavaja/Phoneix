import { createBasicAuthShipment } from "./services/courierIntegrationService.js";

async function testCourier() {
  console.log("Testing Basic Auth Courier Service...");

  const result = await createBasicAuthShipment({
    serviceCode: "sgdirecteuyun",
    orderId: "ORD-998822",
    invoiceNo: "INV-2026-001",
    invoiceDate: "2026-07-31",
    currencyCode: "EUR",
    countryCode: "DE",
    weight: 1.5,
    length: 20,
    breadth: 15,
    height: 10,
    shipper: {
      name: "Ishan Agrawal",
      mobile: "+91 769803174",
      address: "Surat, Gujarat",
      city: "Surat",
      state: "Gujarat",
      country: "IN",
      pincode: "395010",
    },
    consignee: {
      name: "Hans Muller",
      mobile: "+49 151 23456789",
      address: "Hauptstrasse 12",
      city: "Berlin",
      state: "Berlin",
      country: "DE",
      pincode: "10115",
    },
    items: [
      {
        description: "Textile Apparel Sample",
        quantity: 2,
        value: 45.0,
        hs_code: "62052000",
      },
    ],
  });

  console.log("RESULT:", JSON.stringify(result, null, 2));
}

testCourier();
