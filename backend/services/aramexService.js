import axios from "axios";
import https from "https";
import SystemSetting from "../models/SystemSetting.js";

const aramexHttpsAgent = new https.Agent({
  keepAlive: false,
});

/**
 * Get ClientInfo credentials formatted exactly for Aramex Live/Sandbox API
 */
const getClientInfo = async () => {
  const settings = await SystemSetting.findOne({});

  const username = settings?.aramexUsername || process.env.ARAMEX_USERNAME || "test.api@aramex.com";
  const password = settings?.aramexPassword || process.env.ARAMEX_PASSWORD || "Aramex@12345";
  const accountNum = settings?.aramexAccountNumber || process.env.ARAMEX_ACCOUNT_NUMBER || "60531487";
  const pin = settings?.aramexAccountPin || process.env.ARAMEX_ACCOUNT_PIN || "654654";

  // Note: Aramex test account 60531487 is registered under entity "BOM"
  let entity = settings?.aramexAccountEntity || process.env.ARAMEX_ENTITY || "BOM";
  if (accountNum === "60531487") {
    entity = "BOM";
  }
  const country = settings?.aramexAccountCountryCode || process.env.ARAMEX_COUNTRY_CODE || "IN";

  return {
    UserName: username,
    Password: password,
    Version: "v1.0",
    AccountNumber: accountNum,
    AccountPin: pin,
    AccountEntity: entity,
    AccountCountryCode: country,
    Source: 24,
  };
};

const checkIsSimulated = async () => {
  const info = await getClientInfo();
  return (
      info.UserName.includes("your_") ||
      info.Password.includes("your_") ||
      info.AccountNumber.includes("your_")
  );
};

const parseAramexDate = (dateString) => {
  if (!dateString) return new Date();

  if (typeof dateString === 'string' && dateString.includes('/Date(')) {
    // Extract the digits from the string
    const match = dateString.match(/\d+/);
    if (match) {
      return new Date(parseInt(match[0], 10));
    }
  }

  // Fallback for standard date strings
  const fallback = new Date(dateString);
  return isNaN(fallback.getTime()) ? new Date() : fallback;
};

/**
 * 1. Create Shipment (API: CreateShipments)
 * Live Endpoint: https://ws.aramex.net/ShippingAPI.V2/Shipping/Service_1_0.svc/json/CreateShipments
 */
export const createAramexShipment = async ({
                                             sender,
                                             receiver,
                                             parcel,
                                             additionalProperties = [],
                                             items = [],
                                           }) => {
  const { weight, length, width, height, productDescription, shipmentValue, type } = parcel;
  const isDocument = type === "Document";
  const chargeableWeight = Math.max(weight, (length * width * height) / 5000.0);
  const clientInfo = await getClientInfo();

  if (await checkIsSimulated()) {
    const awb = `ARM${Math.floor(100000000 + Math.random() * 900000000)}`;
    return {
      success: true,
      courierShipmentId: `SHP-${awb}`,
      courierTrackingNumber: awb,
      courierStatus: "Booked",
      labelBufferBase64: Buffer.from(`%PDF-1.4\n%... [Simulated Shipping Label for AWB: ${awb}] ...`).toString("base64"),
      simulated: true,
    };
  }

  try {
    const now = new Date();
    const dueDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    // FIX: Properly map Product Group and Type
    const finalProductGroup = parcel.productGroup || "EXP"; // Must be DOM or EXP
    const finalProductType = isDocument ? "PDX" : (parcel.productType || "PPX");

    // FIX: Only apply Customs parameters for International (EXP) shipments
    let finalAdditionalProperties = null;
    if (finalProductGroup === "EXP") {
      finalAdditionalProperties = additionalProperties.length > 0 ? additionalProperties : [
        { CategoryName: "CustomsClearance", Name: "ShipperTaxIdVATEINNumber", Value: sender.taxId || "535453366" },
        { CategoryName: "CustomsClearance", Name: "ConsigneeTaxIdVATEINNumber", Value: receiver.taxId || "P123456789012" },
        { CategoryName: "CustomsClearance", Name: "TaxPaid", Value: "1" },
        { CategoryName: "CustomsClearance", Name: "InvoiceDate", Value: new Date().toLocaleDateString("en-US") },
        { CategoryName: "CustomsClearance", Name: "InvoiceNumber", Value: parcel.invoiceNumber || `Inv-${Date.now().toString().slice(-6)}` },
        { CategoryName: "CustomsClearance", Name: "TaxAmount", Value: "0.00" },
        { CategoryName: "CustomsClearance", Name: "ExporterType", Value: "UT" },
      ];
    }

    const payload = {
      ClientInfo: clientInfo,
      LabelInfo: {
        ReportID: parcel.reportId || 9201, // 9201 is the standard PDF format
        ReportType: "URL",
      },
      Shipments: [
        {
          Reference1: parcel.referenceId || "",
          Reference2: parcel.reference2 || "",
          Reference3: parcel.reference3 || "",
          Shipper: {
            Reference1: sender.id || "",
            Reference2: sender.reference2 || "",
            AccountNumber: clientInfo.AccountNumber,
            PartyAddress: {
              Line1: sender.address || sender.line1 || "",
              Line2: sender.line2 || "",
              Line3: sender.line3 || "",
              City: sender.city || "",
              StateOrProvinceCode: sender.state || "",
              PostCode: sender.pincode || sender.postCode || "",
              CountryCode: sender.country || "IN",
              Longitude: 0,
              Latitude: 0,
              BuildingNumber: sender.buildingNumber || null,
              BuildingName: sender.buildingName || null,
              Floor: sender.floor || null,
              Apartment: sender.apartment || null,
              POBox: sender.poBox || null,
              Description: sender.description || null,
            },
            Contact: {
              Department: sender.department || "",
              PersonName: sender.contactPerson || sender.name || "",
              Title: sender.title || "",
              CompanyName: sender.companyName || sender.name || "",
              PhoneNumber1: sender.mobile || "",
              PhoneNumber1Ext: "",
              PhoneNumber2: sender.phoneNumber2 || "",
              PhoneNumber2Ext: "",
              FaxNumber: sender.faxNumber || "",
              CellPhone: sender.mobile || "",
              EmailAddress: sender.email || "",
              Type: "",
            },
          },
          Consignee: {
            Reference1: receiver.reference1 || "",
            Reference2: receiver.reference2 || "",
            AccountNumber: receiver.accountNumber || "",
            PartyAddress: {
              Line1: receiver.address || receiver.line1 || "",
              Line2: receiver.line2 || "",
              Line3: receiver.line3 || "",
              City: receiver.city || "",
              StateOrProvinceCode: receiver.state || "",
              PostCode: receiver.pincode || receiver.postCode || "",
              CountryCode: receiver.country || "IN",
              Longitude: 0,
              Latitude: 0,
              BuildingNumber: receiver.buildingNumber || "",
              BuildingName: receiver.buildingName || "",
              Floor: receiver.floor || "",
              Apartment: receiver.apartment || "",
              POBox: receiver.poBox || null,
              Description: receiver.description || "",
            },
            Contact: {
              Department: receiver.department || "",
              PersonName: receiver.name || "",
              Title: receiver.title || "",
              CompanyName: receiver.companyName || receiver.name || "",
              PhoneNumber1: receiver.mobile || "",
              PhoneNumber1Ext: "",
              PhoneNumber2: receiver.phoneNumber2 || "",
              PhoneNumber2Ext: "",
              FaxNumber: receiver.faxNumber || "",
              CellPhone: receiver.mobile || "",
              EmailAddress: receiver.email || "",
              Type: "",
            },
          },
          ThirdParty: null, // Set to null unless PaymentType is '3'
          ShippingDateTime: `/Date(${now.getTime()}+0530)/`,
          DueDate: `/Date(${dueDate.getTime()}+0530)/`,
          Comments: productDescription || "E-commerce Goods",
          PickupLocation: parcel.pickupLocation || "",
          OperationsInstructions: parcel.operationsInstructions || "",
          AccountingInstrcutions: parcel.accountingInstructions || "",
          Details: {
            Dimensions: (length && width && height) ? { Length: length, Width: width, Height: height, Unit: "cm" } : null,
            ActualWeight: { Unit: "KG", Value: weight },
            ChargeableWeight: { Unit: "KG", Value: chargeableWeight },
            DescriptionOfGoods: productDescription || "E-commerce Parcel",
            GoodsOriginCountry: sender.country || "IN",
            NumberOfPieces: parcel.pieces || 1,
            ProductGroup: finalProductGroup,
            ProductType: finalProductType,
            PaymentType: parcel.paymentType || "P",
            PaymentOptions: parcel.paymentOptions || "",
            // CustomsValue is only required for International (EXP)
            CustomsValueAmount: finalProductGroup === "EXP" ? {
              CurrencyCode: parcel.currency || "USD",
              Value: shipmentValue || 0,
            } : null,
            CashOnDeliveryAmount: parcel.codAmount ? { CurrencyCode: parcel.currency || "USD", Value: parcel.codAmount } : null,
            InsuranceAmount: null,
            CashAdditionalAmount: null,
            CashAdditionalAmountDescription: "",
            CollectAmount: null,
            Services: parcel.services || "",
            Items: items.length > 0 ? items : [
              {
                PackageType: "Box",
                Quantity: "1",
                Weight: { Unit: "KG", Value: weight },
                CustomsValue: finalProductGroup === "EXP" ? { CurrencyCode: parcel.currency || "USD", Value: shipmentValue || 0 } : null,
                Comments: productDescription,
                GoodsDescription: productDescription,
                Reference: "",
                CommodityCode: parcel.commodityCode || "123456789",
              },
            ],
            AdditionalProperties: finalAdditionalProperties,
          },
          Attachments: [],
          ForeignHAWB: "",
          TransportType: 0,
          PickupGUID: parcel.pickupGUID || "",
          Number: "",
          ScheduledDelivery: null,
        },
      ],
      Transaction: {
        Reference1: "CreateShipment", Reference2: "", Reference3: "", Reference4: "", Reference5: ""
      },
    };

    const response = await axios.post(
        "https://ws.aramex.net/ShippingAPI.V2/Shipping/Service_1_0.svc/json/CreateShipments",
        payload,
        {
          httpsAgent: aramexHttpsAgent,
          headers: {
            "Connection": "close" // Forces Aramex server to cleanly close the socket
          },
          timeout: 15000 // Prevents the request from hanging forever if Aramex is slow
        }
    );

    if (response.data.HasErrors) {
      const errorMsg = response.data.Notifications?.[0]?.Message || "Aramex Shipment booking error";
      throw new Error(errorMsg);
    }

    const shipment = response.data.Shipments[0];

    if (shipment.HasErrors) {
      const shipmentError = shipment.Notifications?.[0]?.Message || "Error on shipment payload processing";
      throw new Error(`Aramex Error: ${shipmentError}`);
    }

    const trackingNumber = shipment.ID;
    const labelUrl = shipment.ShipmentLabel?.LabelURL || "";

    let labelBufferBase64 = "";
    if (labelUrl) {
      try {
        const labelRes = await axios.get(labelUrl, { responseType: "arraybuffer" });
        labelBufferBase64 = Buffer.from(labelRes.data).toString("base64");
      } catch (labelErr) {
        console.warn("Could not fetch Label PDF buffer, returning URL", labelErr.message);
        labelBufferBase64 = Buffer.from(`Label URL: ${labelUrl}`).toString("base64");
      }
    }

    return {
      success: true,
      courierShipmentId: shipment.Reference1 || `SHP-${trackingNumber}`,
      courierTrackingNumber: trackingNumber,
      courierStatus: "Booked",
      labelUrl,
      labelBufferBase64,
      data: response.data,
      simulated: false,
    };
  } catch (err) {
    // FIX: Throw error back to controller instead of returning a fake tracking number
    console.error("Aramex API Error in createAramexShipment:", err.message);
    throw new Error(err.response?.data?.message || err.message);
  }
};

/**
 * 2. Location Serviceability (API: IsAddressServiced)
 * Live Endpoint: https://ws.aramex.net/ShippingAPI.V2/Location/Service_1_0.svc/json/IsAddressServiced
 */
export const checkAramexLocationServiceability = async ({ address, serviceDetails }) => {
  const clientInfo = await getClientInfo();

  if (await checkIsSimulated()) {
    return { success: true, isServiced: true, simulated: true };
  }

  try {
    const payload = {
      ClientInfo: clientInfo,
      Address: {
        Line1: address.line1 || address.address || "ABC Street",
        Line2: address.line2 || "",
        Line3: address.line3 || "",
        City: address.city || "",
        StateOrProvinceCode: address.state || "",
        PostCode: address.pincode || address.postCode || "",
        CountryCode: address.country || address.countryCode || "IN",
        Longitude: address.longitude || 0,
        Latitude: address.latitude || 0,
      },
      ServiceDetails: serviceDetails || {
        ProductGroup: "EXP",
        ProductType: "PDX",
        ServiceMode: 1,
      },
      Transaction: { Reference1: "", Reference2: "", Reference3: "", Reference4: "", Reference5: "" },
    };

    const response = await axios.post(
        "https://ws.aramex.net/ShippingAPI.V2/Location/Service_1_0.svc/json/IsAddressServiced",
        payload,
        {
          httpsAgent: aramexHttpsAgent,
          headers: {
            "Connection": "close" // Forces Aramex server to cleanly close the socket
          },
          timeout: 15000 // Prevents the request from hanging forever if Aramex is slow
        }
    );

    if (response.data.HasErrors) {
      const errorMsg = response.data.Notifications?.[0]?.Message || "Location serviceability check error";
      throw new Error(errorMsg);
    }

    return {
      success: true,
      isServiced: response.data.IsServiced ?? true,
      data: response.data,
      simulated: false,
    };
  } catch (err) {
    console.error("Aramex location serviceability error:", err.message);
    throw new Error(err.response?.data?.message || err.message);
  }
};

/**
 * Address Validation (API: ValidateAddress)
 */
export const checkAramexServiceability = async (address) => {
  return checkAramexLocationServiceability({ address });
};

/**
 * 3. Create Pickup (API: CreatePickup)
 * Live Endpoint: https://ws.aramex.net/ShippingAPI.V2/Shipping/Service_1_0.svc/json/CreatePickup
 */
export const createAramexPickup = async ({
                                           pickupDate,
                                           address,
                                           contact,
                                           pickupItems = [],
                                         }) => {
  const clientInfo = await getClientInfo();

  if (await checkIsSimulated()) {
    const pickupId = `PKP${Math.floor(1000000 + Math.random() * 9000000)}`;
    return {
      success: true,
      pickupId,
      manifestCode: `MNF-${pickupId}`,
      simulated: true,
    };
  }

  try {
    const pDate = pickupDate ? new Date(pickupDate) : new Date();
    const readyTime = pDate;
    const closingTime = new Date(pDate.getTime() + 8 * 60 * 60 * 1000); // 8 hours after ready time

    const payload = {
      ClientInfo: clientInfo,
      LabelInfo: null,
      Pickup: {
        PickupAddress: {
          Line1: address.address || address.line1 || "Seller Pickup Address",
          Line2: address.line2 || "",
          Line3: address.line3 || "",
          City: address.city || "Mumbai",
          StateOrProvinceCode: address.state || "",
          PostCode: address.pincode || address.postCode || "400093",
          CountryCode: address.country || "IN",
        },
        PickupContact: {
          Department: contact.department || "Logistics",
          PersonName: contact.name || contact.personName || "Warehouse Manager",
          Title: contact.title || "",
          CompanyName: contact.companyName || contact.name || "Store",
          PhoneNumber1: contact.mobile || "9999999999",
          PhoneNumber1Ext: "",
          PhoneNumber2: "",
          PhoneNumber2Ext: "",
          FaxNumber: "",
          CellPhone: contact.mobile || "9999999999",
          EmailAddress: contact.email || "test@test.com",
          Type: "",
        },
        PickupLocation: contact.pickupLocation || "Reception",
        PickupDate: `/Date(${pDate.getTime()}+0530)/`,
        ReadyTime: `/Date(${readyTime.getTime()}+0530)/`,
        LastPickupTime: `/Date(${closingTime.getTime()}+0530)/`,
        ClosingTime: `/Date(${closingTime.getTime()}+0530)/`,
        Comments: contact.comments || "Please call upon arrival",
        Reference1: contact.reference || "001",
        Reference2: "",
        Vehicle: "",
        Shipments: null,
        PickupItems: pickupItems.length > 0 ? pickupItems : [
          {
            ProductGroup: "EXP", // Permanently locked to International
            ProductType: "PPX",
            NumberOfShipments: 1,
            PackageType: "Box",
            Payment: "P",
            ShipmentWeight: { Unit: "KG", Value: 0.5 },
            ShipmentVolume: null,
            NumberOfPieces: 1,
            CashAmount: null,
            ExtraCharges: null,
            ShipmentDimensions: null,
            Comments: "",
          },
        ],
        Status: "Ready",
      },
      Transaction: { Reference1: "CreatePickup", Reference2: "", Reference3: "", Reference4: "", Reference5: "" },
    };

    const response = await axios.post(
        "https://ws.aramex.net/ShippingAPI.V2/Shipping/Service_1_0.svc/json/CreatePickup",
        payload,
        {
          httpsAgent: aramexHttpsAgent,
          headers: {
            "Connection": "close" // Forces Aramex server to cleanly close the socket
          },
          timeout: 15000 // Prevents the request from hanging forever if Aramex is slow
        }
    );

    if (response.data.HasErrors) {
      const errorMsg = response.data.Notifications?.[0]?.Message || "Aramex Pickup schedule error";
      throw new Error(errorMsg);
    }

    const pickupId = response.data.Pickup?.GUID || response.data.Pickup?.ID || `PKP${Math.floor(1000000 + Math.random() * 9000000)}`;

    return {
      success: true,
      pickupId,
      manifestCode: `MNF-${pickupId.slice(-6).toUpperCase()}`,
      data: response.data,
      simulated: false,
    };
  } catch (err) {
    console.error("Aramex API Error in createAramexPickup:", err.message);
    throw new Error(err.response?.data?.message || err.message);
  }
};

/**
 * 4. Commercial Invoice Attachment (API: AddShipmentAttachment)
 * Live Endpoint: https://ws.aramex.net/ShippingAPI.V2/Shipping/Service_1_0.svc/json/AddShipmentAttachment
 */
export const addCommercialInvoiceAttachment = async ({
                                                       shipmentNumber,
                                                       productGroup = "EXP",
                                                       originEntity = "AMD",
                                                       attachmentInfo,
                                                     }) => {
  const clientInfo = await getClientInfo();

  if (await checkIsSimulated()) {
    return { success: true, message: "Commercial Invoice attached successfully (Simulated)", simulated: true };
  }

  try {
    const payload = {
      ClientInfo: clientInfo,
      Transaction: { Reference1: "", Reference2: "", Reference3: "", Reference4: "", Reference5: "" },
      ShipmentNumber: shipmentNumber,
      ProductGroup: productGroup,
      OriginEntity: originEntity || clientInfo.AccountEntity,
      AttachmentInfo: {
        FileType: attachmentInfo.fileType || "8", // 8 = Commercial Invoice
        FileName: attachmentInfo.fileName || `CommercialInvoice_${shipmentNumber}`,
        FileExtension: attachmentInfo.fileExtension || "pdf",
        FileContentsAsBase64String: attachmentInfo.fileContentsAsBase64String || "",
      },
    };

    const response = await axios.post(
        "https://ws.aramex.net/ShippingAPI.V2/Shipping/Service_1_0.svc/json/AddShipmentAttachment",
        payload,
        {
          httpsAgent: aramexHttpsAgent,
          headers: {
            "Connection": "close" // Forces Aramex server to cleanly close the socket
          },
          timeout: 15000 // Prevents the request from hanging forever if Aramex is slow
        }
    );

    if (response.data.HasErrors) {
      const errorMsg = response.data.Notifications?.[0]?.Message || "Error attaching Commercial Invoice";
      throw new Error(errorMsg);
    }

    return { success: true, data: response.data, simulated: false };
  } catch (err) {
    console.error("Add Shipment Attachment error:", err.message);
    throw new Error(err.response?.data?.message || err.message);
  }
};

/**
 * 5. CSB V Commodity Data (API: ManageCSB_V_RelatedInfo)
 * Live Endpoint: https://export.in.aramex.net/webapi_v2.1/api/CSB/ManageCSB_V_RelatedInfo
 */
export const manageCSBVRelatedInfo = async (csbData, authToken = "") => {
  const info = await getClientInfo();

  if (await checkIsSimulated()) {
    return { success: true, message: "CSB-V commodity data filed successfully (Simulated)", simulated: true };
  }

  try {
    const headers = { "Content-Type": "application/json" };
    if (authToken) {
      headers["Authorization"] = authToken.startsWith("bearer ") ? authToken : `bearer ${authToken}`;
    }

    const payload = {
      Accountnumber: info.AccountNumber,
      username: info.UserName,
      password: info.Password,
      LoginUsername: info.UserName,
      ...csbData,
    };

    const response = await axios.post(
        "https://export.in.aramex.net/webapi_v2.1/api/CSB/ManageCSB_V_RelatedInfo",
        payload,
        { headers }
    );

    return { success: true, data: response.data, simulated: false };
  } catch (err) {
    console.error("CSB-V Related Info error:", err.message);
    throw new Error(err.response?.data?.message || err.message);
  }
};

/**
 * 6. Shipping Bill Download (API: ShippingBillDownload)
 * Live Endpoint: https://export.in.aramex.net/webapi_v2.0/api/CSB/ShippingBillDownload
 */
export const downloadShippingBill = async (hawbNumbers, authToken = "") => {
  const info = await getClientInfo();

  if (await checkIsSimulated()) {
    const dummyPdf = Buffer.from(`%PDF-1.4 [Simulated Shipping Bill PDF for HAWBs: ${hawbNumbers}]`).toString("base64");
    return { success: true, fileBase64: dummyPdf, simulated: true };
  }

  try {
    const headers = { "Content-Type": "application/json" };
    if (authToken) {
      headers["Authorization"] = authToken.startsWith("bearer ") ? authToken : `bearer ${authToken}`;
    }

    const payload = {
      username: info.UserName,
      password: info.Password,
      LoginUsername: info.UserName,
      Accountnumber: info.AccountNumber,
      HAWBs: Array.isArray(hawbNumbers) ? hawbNumbers.join(",") : hawbNumbers,
    };

    const response = await axios.post(
        "https://export.in.aramex.net/webapi_v2.0/api/CSB/ShippingBillDownload",
        payload,
        { headers }
    );

    return { success: true, data: response.data, simulated: false };
  } catch (err) {
    console.error("Shipping Bill Download error:", err.message);
    throw new Error(err.response?.data?.message || err.message);
  }
};

/**
 * 7. Track Shipment (API: TrackShipments)
 * Live Endpoint: https://ws.aramex.net/ShippingAPI.V2/Tracking/Service_1_0.svc/json/TrackShipments
 */
export const trackAramexShipment = async (trackingNumber) => {
  const clientInfo = await getClientInfo();

  if (await checkIsSimulated() || trackingNumber.startsWith("ARM")) {
    const mockStates = [
      { status: "Booked", description: "Consignment registered on aggregator portal", location: "Warehouse" },
      { status: "Pickup Requested", description: "Courier pickup order submitted to Aramex", location: "Warehouse" },
      { status: "Pickup Scheduled", description: "Pickup runner assigned", location: "Aramex Office" },
      { status: "Picked Up", description: "Voucher received by Courier agent", location: "Transit Hub" },
      { status: "In Transit", description: "Consignment sorting in progress", location: "National Sorting Center" },
      { status: "Out For Delivery", description: "Dispatched with local delivery rider", location: "Destination Hub" },
      { status: "Delivered", description: "Parcel signed and delivered to recipient", location: "Receiver Doorstep" },
    ];

    return {
      success: true,
      status: "In Transit",
      events: mockStates.slice(0, 5).map((e, idx) => ({
        ...e,
        eventTime: new Date(Date.now() - (5 - idx) * 4 * 60 * 60 * 1000),
      })),
      simulated: true,
    };
  }

  try {
    const payload = {
      ClientInfo: clientInfo,
      GetLastTrackingUpdateOnly: false,
      Shipments: Array.isArray(trackingNumber) ? trackingNumber : [trackingNumber],
      Transaction: { Reference1: "", Reference2: "", Reference3: "", Reference4: "", Reference5: "" },
    };

    const response = await axios.post(
        "https://ws.aramex.net/ShippingAPI.V2/Tracking/Service_1_0.svc/json/TrackShipments",
        payload,
        {
          httpsAgent: aramexHttpsAgent,
          headers: {
            "Connection": "close" // Forces Aramex server to cleanly close the socket
          },
          timeout: 15000 // Prevents the request from hanging forever if Aramex is slow
        }
    );

    if (response.data.HasErrors) {
      const errorMsg = response.data.Notifications?.[0]?.Message || "Aramex Tracking API error";
      throw new Error(errorMsg);
    }

    const trackingResults = response.data.TrackingResults?.[0]?.Value || [];

    // APPLY THE PARSER HERE
    const events = trackingResults.map((ev) => ({
      status: ev.UpdateDescription || ev.UpdateAction,
      description: ev.UpdateDescription,
      location: ev.UpdateLocation,
      eventTime: parseAramexDate(ev.UpdateDateTime),
    }));

    let currentStatus = "Booked";
    if (events.length > 0) {
      const latest = events[events.length - 1].status.toLowerCase();
      if (latest.includes("delivered")) currentStatus = "Delivered";
      else if (latest.includes("out for delivery")) currentStatus = "Out For Delivery";
      else if (latest.includes("in transit") || latest.includes("sorting")) currentStatus = "In Transit";
      else if (latest.includes("pickup") || latest.includes("collected")) currentStatus = "Picked Up";
    }

    return {
      success: true,
      status: currentStatus,
      events,
      data: response.data,
      simulated: false,
    };
  } catch (err) {
    console.log(err,"aramex srvice")
    console.error("Aramex tracking API error:", err.message);
    throw new Error(err.response?.data?.message || err.message);
  }
};

/**
 * 8. Rate Calculator (API: CalculateRate)
 * Live Endpoint: https://ws.aramex.net/ShippingAPI.V2/RateCalculator/Service_1_0.svc/json/CalculateRate
 */
export const calculateAramexRate = async ({
                                            originAddress,
                                            destinationAddress,
                                            originCountry,
                                            destinationCountry,
                                            weight,
                                            length = 0,
                                            width = 0,
                                            height = 0,
                                            isDocument = false,
                                            productGroup = "DOM",
                                            productType = "OND",
                                          }) => {
  const chargeableWeight = Math.max(weight, (length * width * height) / 5000.0);
  const clientInfo = await getClientInfo();

  const origCountry = originCountry || originAddress?.country || "IN";
  const destCountry = destinationCountry || destinationAddress?.country || "AE";

  if (await checkIsSimulated()) {
    let baseRate = 350.0;
    let ratePerKg = 80.0;

    if (origCountry.toLowerCase() !== destCountry.toLowerCase()) {
      baseRate = 1200.0;
      ratePerKg = 250.0;
    }

    const baseCharge = baseRate + chargeableWeight * ratePerKg;
    return {
      success: true,
      rate: parseFloat(baseCharge.toFixed(2)),
      chargeableWeight,
      simulated: true,
    };
  }

  try {
    const finalProductGroup = productGroup || "EXP";
    const finalProductType = isDocument ? "PDX" : (productType || "PPX");

    const payload = {
      ClientInfo: clientInfo,
      OriginAddress: {
        Line1: originAddress?.line1 || originAddress?.address || "Warehouse",
        Line2: originAddress?.line2 || "",
        Line3: originAddress?.line3 || "",
        City: originAddress?.city || "Mumbai",
        StateOrProvinceCode: originAddress?.state || originAddress?.stateOrProvinceCode || "",
        PostCode: originAddress?.postCode || originAddress?.pincode || "400093",
        CountryCode: origCountry,
      },
      DestinationAddress: {
        Line1: destinationAddress?.line1 || destinationAddress?.addressLine1 || "Recipient",
        Line2: destinationAddress?.line2 || destinationAddress?.addressLine2 || "",
        Line3: destinationAddress?.line3 || destinationAddress?.addressLine3 || "",
        City: destinationAddress?.city || "Dubai",
        StateOrProvinceCode: destinationAddress?.state || destinationAddress?.stateOrProvinceCode || "",
        PostCode: destinationAddress?.postCode || destinationAddress?.pincode || "",
        CountryCode: destCountry,
      },
      ShipmentDetails: {
        Dimensions: (length && width && height) ? { Length: length, Width: width, Height: height, Unit: "cm" } : null,
        ActualWeight: { Unit: "KG", Value: weight },
        ChargeableWeight: { Unit: "KG", Value: chargeableWeight },
        DescriptionOfGoods: "Ecommerce Parcel",
        GoodsOriginCountry: origCountry,
        NumberOfPieces: 1,
        ProductGroup: finalProductGroup,
        ProductType: finalProductType,
        PaymentType: "P",
        PaymentOptions: "",
        Services: "",
      },
      Transaction: { Reference1: "CalculateRate", Reference2: "", Reference3: "", Reference4: "", Reference5: "" }
    };

    const response = await axios.post(
        "https://ws.aramex.net/ShippingAPI.V2/RateCalculator/Service_1_0.svc/json/CalculateRate",
        payload,
        {
          httpsAgent: aramexHttpsAgent,
          headers: {
            "Connection": "close" // Forces Aramex server to cleanly close the socket
          },
          timeout: 15000 // Prevents the request from hanging forever if Aramex is slow
        }
    );

    if (response.data.HasErrors) {
      const errorObj = response.data.Notifications?.[0];
      const errorMsg = response.data.Notifications?.[0]?.Message || "Aramex API Rate error";
      if (errorObj?.Code === 'ERR61') {
        throw new Error(`The selected courier service (${productType}) is not available for this specific weight or destination route.`);
      }
      throw new Error(errorMsg);
    }

    return {
      success: true,
      rate: response.data.TotalAmount?.Value || 0,
      currency: response.data.TotalAmount?.CurrencyCode || "INR",
      chargeableWeight,
      data: response.data,
      simulated: false,
    };
  } catch (err) {
    console.log(err)
    console.error("Aramex Rate calculation API error:", err.message);
    throw new Error(err.response?.data?.message || err.message);
  }
};

/**
 * 9. Seller KYC Collection (API: SellerKYCCollection)
 * Live Endpoint: https://export.in.aramex.net/webapi_v2.0/api/CSB/SellerKYCCollection
 */
export const submitAramexSellerKYC = async (kycData, authToken = "") => {
  const info = await getClientInfo();

  if (await checkIsSimulated()) {
    return { success: true, message: "Seller KYC submitted to Aramex (Simulated)", simulated: true };
  }

  try {
    const headers = { "Content-Type": "application/json" };
    if (authToken) {
      headers["Authorization"] = authToken.startsWith("bearer ") ? authToken : `bearer ${authToken}`;
    }

    const payload = {
      AccountNumber: info.AccountNumber,
      SellerCode: kycData.sellerCode || "newx",
      SellerName: kycData.sellerName || "Test Seller",
      MobileNo: kycData.mobileNo || "9632587410",
      EmailId: kycData.emailId || "test@example.com",
      CustomerType: kycData.customerType || "Company",
      ADCode: kycData.adCode || "",
      GovtOrNonGovt: kycData.govtOrNonGovt || "P",
      BankName: kycData.bankName || "",
      BankAccountNo: kycData.bankAccountNo || "",
      ADCodeCertificateFileName: kycData.adCodeCertificateFileName || "",
      ADCodeCertificateExt: kycData.adCodeCertificateExt || ".jpg",
      ADCodeFileAttachement: kycData.adCodeFileAttachement || "",
    };

    const response = await axios.post(
        "https://export.in.aramex.net/webapi_v2.0/api/CSB/SellerKYCCollection",
        payload,
        { headers }
    );

    return { success: true, data: response.data, simulated: false };
  } catch (err) {
    console.error("Seller KYC Collection error:", err.message);
    throw new Error(err.response?.data?.message || err.message);
  }
};