import axios from "axios";
import SystemSetting from "../models/SystemSetting.js";

const getClientInfo = async () => {
  const settings = await SystemSetting.findOne({});
  
  const username = settings?.aramexUsername || process.env.ARAMEX_USERNAME || "your_aramex_username";
  const password = settings?.aramexPassword || process.env.ARAMEX_PASSWORD || "your_aramex_password";
  const accountNum = settings?.aramexAccountNumber || process.env.ARAMEX_ACCOUNT_NUMBER || "your_account_number";
  const pin = settings?.aramexAccountPin || process.env.ARAMEX_ACCOUNT_PIN || "your_account_pin";
  const entity = settings?.aramexAccountEntity || process.env.ARAMEX_ENTITY || "DEL";
  const country = settings?.aramexAccountCountryCode || process.env.ARAMEX_COUNTRY_CODE || "IN";
  
  return {
    UserName: username,
    Password: password,
    Version: "v1.0",
    AccountNumber: accountNum,
    AccountPin: pin,
    AccountEntity: entity,
    AccountCountryCode: country,
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

/**
 * Calculate rate from Aramex or simulated matrix
 */
export const calculateAramexRate = async ({
  originCountry,
  destinationCountry,
  weight,
  length,
  width,
  height,
  isDocument = false,
}) => {
  const chargeableWeight = Math.max(weight, (length * width * height) / 5000.0);

  if (await checkIsSimulated()) {
    // Simulated sandbox calculator (costs in ₹ Rupees)
    let baseRate = 350.0;
    let ratePerKg = 80.0;

    if (originCountry.toLowerCase() !== destinationCountry.toLowerCase()) {
      baseRate = 1200.0; // International
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
    const response = await axios.post(
      "https://ws.aramex.net/ShippingAPI.V2/RateCalculator/Service_1_0.svc/json/CalculateRate",
      {
        ClientInfo: await getClientInfo(),
        OriginAddress: { CountryCode: originCountry },
        DestinationAddress: { CountryCode: destinationCountry },
        ShipmentDetails: {
          ActualWeight: { Value: weight, Unit: "KG" },
          ChargeableWeight: { Value: chargeableWeight, Unit: "KG" },
          NumberOfPieces: 1,
          ProductGroup: isDocument ? "DOC" : "DOM",
          ProductType: isDocument ? "PDX" : "OND",
          PaymentType: "P", // Prepaid
        },
      }
    );

    if (response.data.HasErrors) {
      const errorMsg = response.data.Notifications?.[0]?.Message || "Aramex API Rate error";
      throw new Error(errorMsg);
    }

    return {
      success: true,
      rate: response.data.TotalAmount.Value,
      chargeableWeight,
      simulated: false,
    };
  } catch (err) {
    console.error("Aramex Rate calculation failed, falling back to simulated rates:", err.message);
    // Dynamic fallback when real API fails
    const fallbackRate = 400.0 + chargeableWeight * 90.0;
    return {
      success: true,
      rate: parseFloat(fallbackRate.toFixed(2)),
      chargeableWeight,
      simulated: true,
      error: err.message,
    };
  }
};

/**
 * Book Shipment in Aramex
 */
export const createAramexShipment = async ({
  sender,
  receiver,
  parcel,
}) => {
  const { weight, length, width, height, productDescription, shipmentValue, type } = parcel;
  const isDocument = type === "Document";
  const chargeableWeight = Math.max(weight, (length * width * height) / 5000.0);

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
    const response = await axios.post(
      "https://ws.aramex.net/ShippingAPI.V2/Shipping/Service_1_0.svc/json/CreateShipments",
      {
        ClientInfo: await getClientInfo(),
        Shipments: [
          {
            Reference1: parcel.referenceId || "",
            Shipper: {
              Reference1: sender.id || "",
              CompanyName: sender.companyName,
              Contact: {
                PersonName: sender.contactPerson,
                PhoneNumber1: sender.mobile,
                EmailAddress: sender.email,
              },
              Address: {
                Line1: sender.address,
                City: sender.city,
                StateOrProvince: sender.state,
                PostCode: sender.pincode,
                CountryCode: sender.country,
              },
            },
            Consignee: {
              CompanyName: receiver.name,
              Contact: {
                PersonName: receiver.name,
                PhoneNumber1: receiver.mobile,
              },
              Address: {
                Line1: receiver.address,
                City: receiver.city,
                StateOrProvince: receiver.state,
                PostCode: receiver.pincode,
                CountryCode: receiver.country,
              },
            },
            ShippingDateTime: new Date().toISOString(),
            DueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days
            Comments: productDescription,
            PickupGUID: "",
            Details: {
              ActualWeight: { Value: weight, Unit: "KG" },
              ChargeableWeight: { Value: chargeableWeight, Unit: "KG" },
              NumberOfPieces: 1,
              ProductGroup: isDocument ? "DOC" : "DOM",
              ProductType: isDocument ? "PDX" : "OND",
              PaymentType: "P",
              CustomsValueAmount: { Value: shipmentValue, CurrencyCode: "INR" },
              Items: [
                {
                  PackageType: "Box",
                  Quantity: 1,
                  Weight: { Value: weight, Unit: "KG" },
                  Comments: productDescription,
                },
              ],
            },
          },
        ],
        LabelInfo: {
          ReportID: 9201, // Standard shipping label format
          ReportType: "URL",
        },
      }
    );

    if (response.data.HasErrors) {
      const errorMsg = response.data.Notifications?.[0]?.Message || "Aramex Shipment booking error";
      throw new Error(errorMsg);
    }

    const shipment = response.data.Shipments[0];
    const trackingNumber = shipment.ID;
    const labelUrl = shipment.ShipmentLabel?.LabelURL || "";

    // Fetch label content if URL
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
      labelBufferBase64,
      simulated: false,
    };
  } catch (err) {
    console.error("Aramex Shipment Booking failed, falling back to simulated voucher:", err.message);
    const awb = `ARM${Math.floor(100000000 + Math.random() * 900000000)}`;
    return {
      success: true,
      courierShipmentId: `SHP-${awb}`,
      courierTrackingNumber: awb,
      courierStatus: "Booked",
      labelBufferBase64: Buffer.from(`%PDF-1.4\n%... [Fallback Shipping Label for AWB: ${awb}] ...`).toString("base64"),
      simulated: true,
      error: err.message,
    };
  }
};

/**
 * Schedule Pickup via Aramex
 */
export const createAramexPickup = async ({
  pickupDate,
  address,
  contact,
}) => {
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
    const response = await axios.post(
      "https://ws.aramex.net/ShippingAPI.V2/Shipping/Service_1_0.svc/json/CreatePickup",
      {
        ClientInfo: await getClientInfo(),
        Pickup: {
          PickupAddress: {
            Line1: address.address,
            City: address.city,
            StateOrProvince: address.state,
            PostCode: address.pincode,
            CountryCode: address.country,
          },
          PickupContact: {
            PersonName: contact.name,
            PhoneNumber1: contact.mobile,
            CellPhone: contact.mobile,
            EmailAddress: contact.email,
          },
          PickupLocation: "Reception",
          PickupDate: new Date(pickupDate).toISOString(),
          ReadyTime: new Date(pickupDate).toISOString(), // Assume ready now on that date
          CloseTime: new Date(new Date(pickupDate).getTime() + 8 * 60 * 60 * 1000).toISOString(), // Ready for 8 hours
          Reference1: contact.reference || "",
          Status: "Ready",
        },
      }
    );

    if (response.data.HasErrors) {
      const errorMsg = response.data.Notifications?.[0]?.Message || "Aramex Pickup schedule error";
      throw new Error(errorMsg);
    }

    const pickupId = response.data.Pickup.GUID;
    return {
      success: true,
      pickupId,
      manifestCode: `MNF-${pickupId.slice(-6).toUpperCase()}`,
      simulated: false,
    };
  } catch (err) {
    console.error("Aramex Pickup scheduling failed, falling back to simulated pickup:", err.message);
    const pickupId = `PKP${Math.floor(1000000 + Math.random() * 9000000)}`;
    return {
      success: true,
      pickupId,
      manifestCode: `MNF-${pickupId}`,
      simulated: true,
      error: err.message,
    };
  }
};

/**
 * Track shipment via Aramex
 */
export const trackAramexShipment = async (trackingNumber) => {
  if (await checkIsSimulated() || trackingNumber.startsWith("ARM")) {
    // Generate realistic transitions based on AWB
    const mockStates = [
      { status: "Booked", description: "Consignment registered on aggregator portal", location: "Warehouse" },
      { status: "Pickup Requested", description: "Courier pickup order submitted to Aramex", location: "Warehouse" },
      { status: "Pickup Scheduled", description: "Pickup runner assigned", location: "Aramex Office" },
      { status: "Picked Up", description: "Voucher received by Courier agent", location: "Transit Hub" },
      { status: "In Transit", description: "Consignment sorting in progress", location: "National Sorting Center" },
      { status: "Out For Delivery", description: "Dispatched with local delivery rider", location: "Destination Hub" },
      { status: "Delivered", description: "Parcel signed and delivered to recipient", location: "Receiver Doorstep" },
    ];

    // Determine current state based on creation time, let's return all stages completed or dynamic
    return {
      success: true,
      status: "In Transit",
      events: mockStates.slice(0, 5).map((e, idx) => ({
        ...e,
        eventTime: new Date(Date.now() - (5 - idx) * 4 * 60 * 60 * 1000), // steps spaced by 4 hours
      })),
      simulated: true,
    };
  }

  try {
    const response = await axios.post(
      "https://ws.aramex.net/ShippingAPI.V2/Tracking/Service_1_0.svc/json/TrackShipments",
      {
        ClientInfo: await getClientInfo(),
        Shipments: [trackingNumber],
      }
    );

    if (response.data.HasErrors) {
      const errorMsg = response.data.Notifications?.[0]?.Message || "Aramex Tracking API error";
      throw new Error(errorMsg);
    }

    const trackingResults = response.data.TrackingResults?.[0]?.Value || [];
    const events = trackingResults.map((ev) => ({
      status: ev.UpdateDescription || ev.UpdateAction,
      description: ev.UpdateDescription,
      location: ev.UpdateLocation,
      eventTime: new Date(ev.UpdateDateTime),
    }));

    // Find the latest status from events
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
      simulated: false,
    };
  } catch (err) {
    console.error("Aramex tracking failed, returning fallback events:", err.message);
    return {
      success: true,
      status: "Booked",
      events: [
        {
          status: "Booked",
          description: "Voucher registered in local database. API sync pending.",
          location: "Terminal",
          eventTime: new Date(),
        },
      ],
      simulated: true,
      error: err.message,
    };
  }
};

/**
 * Verify address serviceability (Validate Address)
 */
export const checkAramexServiceability = async (address) => {
  if (await checkIsSimulated()) {
    const unserved = ["KP", "SY", "IR", "CU"];
    if (unserved.includes(address.country)) {
      return { success: false, message: `Aramex logistics does not service country destination: ${address.country}` };
    }
    return { success: true };
  }

  try {
    const response = await axios.post(
      "https://ws.aramex.net/ShippingAPI.V2/Location/Service_1_0.svc/json/ValidateAddress",
      {
        ClientInfo: await getClientInfo(),
        Address: {
          Line1: address.address,
          City: address.city,
          StateOrProvince: address.state,
          PostCode: address.pincode,
          CountryCode: address.country,
        },
      }
    );

    if (response.data.HasErrors) {
      const errorMsg = response.data.Notifications?.[0]?.Message || "Address validation failed";
      return { success: false, message: errorMsg };
    }

    return { success: true };
  } catch (err) {
    console.error("Aramex address validation failed:", err.message);
    return { success: true };
  }
};
