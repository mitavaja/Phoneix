import { verifyToken } from "../utils/generateToken.js";
import User from "../models/User.js";

const optionalAuthMiddleware = async (req, res, next) => {
  try {
    let token = req.headers.authorization;
    if (token && token.startsWith("Bearer ")) {
      token = token.split(" ")[1];
      const decoded = verifyToken(token);
      if (decoded && decoded.id) {
        const user = await User.findById(decoded.id).select("-password");
        if (user && user.status !== "Blocked") {
          req.user = user;
        }
      }
    }
    next();
  } catch (error) {
    next();
  }
};

export default optionalAuthMiddleware;
