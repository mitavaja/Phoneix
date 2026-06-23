import { verifyToken } from "../utils/generateToken.js";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (token && token.startsWith("Bearer ")) {
      token = token.split(" ")[1];
      const decoded = verifyToken(token);

      if (!decoded) {
        return res.status(401).json({ message: "Not authorized: Token signature invalid or expired" });
      }

      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return res.status(401).json({ message: "Not authorized: User profile not found" });
      }

      if (user.status === "Blocked") {
        return res.status(403).json({ message: "Access forbidden: Account suspended" });
      }

      req.user = user;
      next();
    } else {
      res.status(401).json({ message: "Not authorized: Token signature missing" });
    }
  } catch (error) {
    res.status(401).json({ message: "Not authorized: Authentication process exception", error: error.message });
  }
};

export default authMiddleware;
