import axios from "axios";

async function testAramex() {
  const url = "https://ws.aramex.net/ShippingAPI.V2/Shipping/Service_1_0.svc/json/CreateShipments";

  const now = Date.now();

  const payload = {
    ClientInfo: {
      UserName: "test.api@aramex.com",
      Password: "Aramex@12345",
      Version: "v1.0",
      AccountNumber: "60531487",
      AccountPin: "654654",
      AccountEntity: "BOM",
      AccountCountryCode: "IN",
      Source: 24
    },
    LabelInfo: {
      ReportID: 9729,
      ReportType: "URL"
    },
    Shipments: [
      {
        Reference1: "REF-1001",
        Reference2: "",
        Reference3: "",
        Shipper: {
          Reference1: "SENDER-01",
          Reference2: "",
          AccountNumber: "60531487",
          PartyAddress: {
            Line1: "111 Dayanand Park, Near Zaveri Bazar",
            Line2: "",
            Line3: "",
            City: "New Delhi",
            StateOrProvinceCode: "DL",
            PostCode: "110001",
            CountryCode: "IN",
            Longitude: 0,
            Latitude: 0
          },
          Contact: {
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
          }
        },
        Consignee: {
          Reference1: "REC-01",
          Reference2: "",
          AccountNumber: "",
          PartyAddress: {
            Line1: "121 Nambusunhwan-ro 19-gil Gangseo-gu",
            Line2: "",
            Line3: "",
            City: "Seoul",
            StateOrProvinceCode: "",
            PostCode: "07641",
            CountryCode: "KR",
            Longitude: 0,
            Latitude: 0
          },
          Contact: {
            Department: "",
            PersonName: "Vikram Singh",
            Title: "",
            CompanyName: "Vikram Trading",
            PhoneNumber1: "8454075645",
            PhoneNumber1Ext: "",
            PhoneNumber2: "",
            PhoneNumber2Ext: "",
            FaxNumber: "",
            CellPhone: "8454075645",
            EmailAddress: "vikram@example.com",
            Type: ""
          }
        },
        ThirdParty: {
          Reference1: "",
          Reference2: "",
          AccountNumber: "",
          PartyAddress: {
            Line1: "", Line2: "", Line3: "", City: "", StateOrProvinceCode: "", PostCode: "", CountryCode: "",
            Longitude: 0, Latitude: 0
          },
          Contact: {
            Department: "", PersonName: "", Title: "", CompanyName: "", PhoneNumber1: "", PhoneNumber1Ext: "", PhoneNumber2: "", PhoneNumber2Ext: "", FaxNumber: "", CellPhone: "", EmailAddress: "", Type: ""
          }
        },
        ShippingDateTime: `/Date(${now}+0530)/`,
        DueDate: `/Date(${now + 86400000}+0530)/`,
        Comments: "Test International Parcel",
        Details: {
          Dimensions: {
            Length: 10,
            Width: 10,
            Height: 10,
            Unit: "cm"
          },
          ActualWeight: {
            Unit: "KG",
            Value: 0.5
          },
          ChargeableWeight: {
            Unit: "KG",
            Value: 0.5
          },
          DescriptionOfGoods: "Books Parcel",
          GoodsOriginCountry: "IN",
          NumberOfPieces: 1,
          ProductGroup: "EXP",
          ProductType: "PPX",
          PaymentType: "P",
          PaymentOptions: "",
          CustomsValueAmount: {
            CurrencyCode: "USD",
            Value: 200
          },
          Services: "",
          Items: [
            {
              PackageType: "Box",
              Quantity: 1,
              Weight: {
                Unit: "KG",
                Value: 0.5
              },
              Comments: "Copper Water Bottle",
              GoodsDescription: "Gold Facial Kit"
            }
          ],
          AdditionalProperties: [
            {
              CategoryName: "CustomsClearance",
              Name: "ShipperTaxIdVATEINNumber",
              Value: "27AAACP1234F1Z5"
            },
            {
              CategoryName: "CustomsClearance",
              Name: "ConsigneeTaxIdVATEINNumber",
              Value: "P123456789012"
            },
            {
              CategoryName: "CustomsClearance",
              Name: "TaxPaid",
              Value: "1"
            },
            {
              CategoryName: "CustomsClearance",
              Name: "InvoiceDate",
              Value: "07/26/2026"
            },
            {
              CategoryName: "CustomsClearance",
              Name: "InvoiceNumber",
              Value: "INV-10023"
            },
            {
              CategoryName: "CustomsClearance",
              Name: "ExporterType",
              Value: "UT"
            }
          ]
        }
      }
    ],
    Transaction: {
      Reference1: "",
      Reference2: "",
      Reference3: "",
      Reference4: "",
      Reference5: ""
    }
  };

  try {
    const res = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    });
    console.log("SUCCESS! Response Data:", JSON.stringify(res.data, null, 2));
  } catch (err) {
    if (err.response) {
      console.log("ERROR STATUS:", err.response.status);
      console.log("ERROR DATA:", JSON.stringify(err.response.data, null, 2));
    } else {
      console.log("ERROR:", err.message);
    }
  }
}

testAramex();
