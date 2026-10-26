export const fetchLocationByPincode = async (pincode, country = "IN") => {
    if (!pincode || String(pincode).trim().length < 3) return null;
    const c = String(country || "IN").toUpperCase();
    const cleanPin = String(pincode).trim();

    try {
        if (c === "IN") {
            if (/^\d{6}$/.test(cleanPin)) {
                const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`);
                const data = await res.json();
                if (data && data[0] && data[0].Status === "Success" && data[0].PostOffice?.length > 0) {
                    const po = data[0].PostOffice[0];
                    return {
                        city: po.District || po.Block || po.Circle || "",
                        state: po.State || "",
                        country: "IN"
                    };
                }
            }
        } else {
            const zippoCountry = c.toLowerCase();
            const res = await fetch(`https://api.zippopotam.us/${zippoCountry}/${encodeURIComponent(cleanPin)}`);
            if (res.ok) {
                const data = await res.json();
                if (data && data.places && data.places.length > 0) {
                    const pl = data.places[0];
                    return {
                        city: pl["place name"] || "",
                        state: pl["state abbreviation"] || pl["state"] || "",
                        country: c
                    };
                }
            }
        }
    } catch (err) {
        console.debug("Postal auto-fetch skipped:", err.message);
    }
    return null;
};
