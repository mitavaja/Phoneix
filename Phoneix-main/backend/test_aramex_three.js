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

async function testCreatePickup() {
  console.log("\n--- Testing 2. CreatePickup ---");
  const url = "https://ws.aramex.net/ShippingAPI.V2/Shipping/Service_1_0.svc/json/CreatePickup";
  const now = Date.now();
  const payload = {
    ClientInfo: clientInfo,
    Pickup: {
      PickupAddress: {
        Line1: "Seller Pickup Address 123",
        Line2: "",
        Line3: "",
        City: "Mumbai",
        StateOrProvinceCode: "MH",
        PostCode: "400093",
        CountryCode: "IN"
      },
      PickupContact: {
        Department: "Logistics",
        PersonName: "ISHAN AGRAWAL",
        Title: "Manager",
        CompanyName: "Phoenix Commerce",
        PhoneNumber1: "769803174",
        PhoneNumber1Ext: "",
        PhoneNumber2: "",
        PhoneNumber2Ext: "",
        FaxNumber: "",
        CellPhone: "769803174",
        EmailAddress: "phoenixcommerce02@gmail.com",
        Type: ""
      },
      PickupLocation: "Reception Desk",
      PickupDate: `/Date(${now + 86400000}+0530)/`,
      ReadyTime: `/Date(${now + 86400000}+0530)/`,
      LastPickupTime: `/Date(${now + 86400000 + 28800000}+0530)/`,
      ClosingTime: `/Date(${now + 86400000 + 28800000}+0530)/`,
      Comments: "Handle with care",
      Reference1: "PICKUP-001",
      Reference2: "",
      Reference3: "",
      Vehicle: "",
      PickupItems: [
        {
          ProductGroup: "EXP",
          ProductType: "PPX",
          NumberOfShipments: 1,
          PackageType: "Box",
          Payment: "P",
          ShipmentWeight: {
            Unit: "KG",
            Value: 0.5
          },
          ShipmentVolume: {
            Unit: "cm3",
            Value: 1000
          },
          NumberOfPieces: 1,
          Comments: "Electronics Parcel",
          CashAmount: null,
          ExtraCharges: null,
          ShipmentDimensions: {
            Length: 10,
            Width: 10,
            Height: 10,
            Unit: "cm"
          }
        }
      ],
      Status: "Ready"
    },
    Transaction: transaction
  };

  try {
    const res = await axios.post(url, payload, { headers: { "Content-Type": "application/json", "Accept": "application/json" } });
    console.log("CreatePickup STATUS:", res.status);
    console.log("CreatePickup RESPONSE:", JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.log("CreatePickup ERROR:", err.response ? err.response.data : err.message);
  }
}

testCreatePickup();
