import jwt from "jsonwebtoken";

export const verifyTokenMiddleware = (req, res, next) => {
    console.log("chala middleware")
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    
    if (!token) {
      console.log("token not found");
      return res.status(400).json({
        message: "UnAuth User",
        status: false,
      });
    }

    const decoded = jwt.verify(token, "todoB@f123");

    req.userEmail = decoded.email;
    
    next();
  } catch (err) {
    console.log(err)
    console.log("nahi chala")
    res.status(401).json("unAuth User");
  }
};