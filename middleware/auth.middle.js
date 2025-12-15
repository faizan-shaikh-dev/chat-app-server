import jwt from "jsonwebtoken";

export const chekAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      return res.status(404).json({ message: "Token not provided" });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Invalid Token" });
      } else {
        req.user = decoded;
        next();
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
