const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (req.user && allowedRoles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ message: `Access forbidden: Required role authorization [${allowedRoles.join(", ")}] not met` });
    }
  };
};

export default roleMiddleware;
