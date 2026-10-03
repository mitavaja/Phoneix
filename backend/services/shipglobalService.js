import axios from "axios";

const BASE_URL = process.env.SHIPGLOBAL_BASE_URL || "https://app.shipglobal.in/apiv1";
const USERNAME = process.env.SHIPGLOBAL_USERNAME || "demo@example.com";
const PASSWORD = process.env.SHIPGLOBAL_PASSWORD || "Demo@123";

/**
 * Creates an Axios instance with Basic Auth and default JSON headers
 */
const getShipGlobalClient = () => {
    const token = Buffer.from(`${USERNAME}:${PASSWORD}`).toString("base64");
    return axios.create({
        baseURL: BASE_URL,
        headers: {
            Authorization: `Basic ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        timeout: 20000,
    });
};

/**
 * 1. Rate Calculator API
 * @param {Object} params
 * @param {number|string} params.weight - Weight in KG
 * @param {string} params.destinationCountry - ISO 2-letter country code (e.g., 'GB', 'US', 'AE')
 * @param {string} params.postalCode - Destination postcode/zipcode
 * @returns {Promise<Object>} Formatted rate list
 */
export const calculateShipGlobalRate = async ({ weight, destinationCountry, postalCode }) => {
    try {
        const client = getShipGlobalClient();

        const payload = {
            package_weight: String(parseFloat(weight).toFixed(2)),
            country_iso_code_2: destinationCountry.toUpperCase().trim(),
            postcode: String(postalCode || "").trim(),
        };

        const response = await client.post("/rates/calculate", payload);

        if (!response.data?.success) {
            throw new Error(response.data?.error || response.data?.message || "Failed to calculate ShipGlobal rate.");
        }

        return {
            success: true,
            billedWeight: response.data.billed_weight,
            billedWeightUnit: response.data.billed_weight_unit,
            currency: response.data.currency || "INR",
            services: response.data.services || [],
        };
    } catch (error) {
        const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message;
        console.error("ShipGlobal Rate Calculation Error:", errorMsg);
        throw new Error(errorMsg);
    }
};

/**
 * 2. Add Order API
 * @param {Object} orderData - Order payload matching ShipGlobal requirements
 * @returns {Promise<Object>} Created order details
 */
export const createShipGlobalOrder = async (orderData) => {
    try {
        const client = getShipGlobalClient();
        const response = await client.post("/order/add", orderData);

        console.dir(response,{depth:2});
        if (!response.data?.success) {
            throw new Error(response.data?.error || response.data?.message || "Failed to create ShipGlobal order.");
        }

        return response.data;
    } catch (error) {
        console.log(error);
        const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message;
        console.error("ShipGlobal Order Creation Error:", errorMsg);
        throw new Error(errorMsg);
    }
};

/**
 * 3. Pay & Get Label API
 * @param {Object} labelData - E.g. { order_id, invoice_no, etc. }
 * @returns {Promise<Object>} Label URL or PDF data
 */
export const getShipGlobalLabel = async (labelData) => {
    try {
        const client = getShipGlobalClient();
        const response = await client.post("/order/label", labelData);

        if (!response.data?.success) {
            throw new Error(response.data?.error || response.data?.message || "Failed to retrieve ShipGlobal label.");
        }

        return response.data;
    } catch (error) {
        const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message;
        console.error("ShipGlobal Label Error:", errorMsg);
        throw new Error(errorMsg);
    }
};

/**
 * 4. Tracking API
 * @param {string} trackingNumber - AWB / Tracking Code
 * @returns {Promise<Object>} Tracking milestone logs
 */
export const trackShipGlobalShipment = async (trackingNumber) => {
    try {
        const client = getShipGlobalClient();
        const response = await client.post("/tracking", {
            tracking_number: String(trackingNumber).trim(),
        });

        if (!response.data?.success) {
            throw new Error(response.data?.error || response.data?.message || "Tracking lookup failed.");
        }

        return response.data;
    } catch (error) {
        const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message;
        console.error("ShipGlobal Tracking Error:", errorMsg);
        throw new Error(errorMsg);
    }
};

/**
 * 5. Cancel & Refund Order API
 * @param {string|number} orderId - ShipGlobal Order ID or Invoice Number
 * @returns {Promise<Object>}
 */
export const cancelShipGlobalOrder = async (orderId) => {
    try {
        const client = getShipGlobalClient();
        const response = await client.post("/orders/cancel", {
            order_id: orderId,
        });

        if (!response.data?.success) {
            throw new Error(response.data?.error || response.data?.message || "Failed to cancel ShipGlobal order.");
        }

        return response.data;
    } catch (error) {
        const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message;
        console.error("ShipGlobal Order Cancel Error:", errorMsg);
        throw new Error(errorMsg);
    }
};