import { verifyToken } from "../utils/generateToken.js";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (token && token.startsWith("Bearer ")) {
      token = token.split(" ")[1];
      const decoded = verifyToken(token);

      if (!decoded) {
        console.log("AuthMiddleware 401: Token verification failed (verifyToken returned null)");
        return res.status(401).json({ message: "Not authorized: Token signature invalid or expired" });
      }

      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        console.log("AuthMiddleware 401: User not found in DB. decoded.id:", decoded.id);
        return res.status(401).json({ message: "Not authorized: User profile not found" });
      }

      if (user.status === "Blocked") {
        console.log("AuthMiddleware 403: User is blocked");
        return res.status(403).json({ message: "Access forbidden: Account suspended" });
      }

      req.user = user;
      next();
    } else {
      console.log("AuthMiddleware 401: Token missing or doesn't start with Bearer");
      res.status(401).json({ message: "Not authorized: Token signature missing" });
    }
  } catch (error) {
    console.log("AuthMiddleware 401: Exception thrown:", error.message);
    res.status(401).json({ message: "Not authorized: Authentication process exception", error: error.message });
  }
};

export default authMiddleware;
