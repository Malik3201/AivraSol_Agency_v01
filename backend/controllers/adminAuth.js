import { AdminAuth } from "../models/adminAuth.js";
import jwt from "jsonwebtoken";

const secret_key = process.env.JWT_SECRET || "5and5make10"
export async function adminLogin(req, res) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password)
      return res.json({ success: false, message: "All fields are required" });
    const auth = await AdminAuth.findOne({ email, password });
    if (!auth) return res.json({ success: false, message: "admin not found" });

    //JWT Token
    const token = jwt.sign(
      { id: auth._id, email: auth.email, role: "admin" },
      secret_key,
      { expiresIn: "1d" }
    );

    //success response
    return res.json({
      success: true,
      message: "admin authentication succes",
      token,
      auth,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
}
export async function adminLogout(req, res) {
  try {
    const { id } = req.params || {};
    if (!id)
      return res.json({
        success: false,
        message: "admin id required for logout",
      });

    const findAdmin = await AdminAuth.findById( id );
    if (!findAdmin)
      return res.json({ success: false, message: "admin not found" });
    //success response
    return res.json({ success: true, message: "admin logedOut" });
  } catch (error) {
    res.json({ success: false, message: "admin not found" });
  }
}
