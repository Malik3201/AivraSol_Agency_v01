import jwt from "jsonwebtoken";
import { AdminAuth } from "../models/adminAuth.js";

const SECRET_KEY = process.env.JWT_SECRET || "5and5make10";

// Verifies the JWT issued by /admin/login.
// Accepts the token via:
//  - Authorization header: `Bearer <token>`
//  - x-admin-token header
// Falls through with a 401 JSON response if missing/invalid.
export async function verifyAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization || "";
    const headerToken =
      typeof authHeader === "string" && authHeader.toLowerCase().startsWith("bearer ")
        ? authHeader.slice(7).trim()
        : "";
    const altToken = req.headers["x-admin-token"];
    const token = headerToken || (typeof altToken === "string" ? altToken : "");

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Admin authentication required" });
    }

    const decoded = jwt.verify(token, SECRET_KEY);
    if (!decoded || decoded.role !== "admin" || !decoded.id) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid admin token" });
    }

    // Confirm the admin still exists. Cheap lookup, keeps revoked admins out.
    const admin = await AdminAuth.findById(decoded.id).lean();
    if (!admin) {
      return res
        .status(401)
        .json({ success: false, message: "Admin no longer exists" });
    }

    req.admin = { id: String(admin._id), email: admin.email };
    return next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired admin token" });
  }
}
