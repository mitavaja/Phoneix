import crypto from "crypto";

export const generateToken = (payload) => {
  const JWT_SECRET = process.env.JWT_SECRET || "phreight-super-secret-key-1049281a";
  const header = { alg: "HS256", typ: "JWT" };
  
  // Expiry time of 30 days
  const fullPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url");
  const encodedPayload = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");
  
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64url");
    
  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

export const verifyToken = (token) => {
  const JWT_SECRET = process.env.JWT_SECRET || "phreight-super-secret-key-1049281a";
  try {
    const [encodedHeader, encodedPayload, signature] = token.split(".");
    
    if (!encodedHeader || !encodedPayload || !signature) {
      console.log("verifyToken failed: Missing parts");
      return null;
    }
    
    const expectedSignature = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest("base64url");
      
    if (signature !== expectedSignature) {
      console.log("verifyToken failed: signature mismatch");
      console.log("JWT_SECRET used:", JWT_SECRET);
      console.log("expected:", expectedSignature);
      console.log("received:", signature);
      return null;
    }
    
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf-8"));
    
    // Check expiration
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
      console.log("verifyToken failed: Token expired");
      return null;
    }

    return payload;
  } catch (error) {
    console.log("verifyToken failed: Exception", error.message);
    return null;
  }
};
