import { Service } from "../models/service.js";

export async function getServices(req, res) {
  const services = await Service.find();
  if (services.length === 0)
    return res.json({ succes: false, message: "No any service found" });
  res.json({ succes: true, services, message: "all services loaded" });
}

export async function addService(req, res) {
  const { name, slug, description, icon, image, featured } = req.body || {};
  if (!name || !slug || !description || !icon || !image)
    return res.json({ success: false, message: "All fields are required" });
  const existingService = await Service.findOne({ name });
  if (existingService)
    return res.json({
      success: false,
      message: "This services already existed",
    });
  const newService = await Service.create({
    name,
    slug,
    description,
    icon,
    image,
    featured,
  });
  //succes response
  res.json({ success: true, message: "service added", newService });
}

export async function editService(req, res) {
  const { name, slug, description, icon, image, featured } = req.body || {};
  if (!name || !slug || !description || !icon || !image || !featured)
    return res.json({ success: false, message: "All fields are required" });
  const { id } = req.params || {};

  const service = await Service.findById(id);
  if (!service)
    return res.json({
      success: false,
      message: "service not found",
    });

  const existingService = await Service.findOne({ name, _id: { $ne: id } });
  if (existingService) {
    return res.json({
      success: false,
      message: "A service with this name already exists",
    });
  }

  const updatedService = await Service.findOneAndUpdate(
    { _id: id },
    { name, slug, description, icon, image, featured },
    { new: true }
  );
  res.json({ success: true, message: "Service updated done", updatedService });
}

export async function deleteService(req, res) {
  const { id } = req.params || {};
  if (!id) return res.json({ success: false, message: "service Id required" });

  const findService = await Service.findByIdAndDelete(id);
  if (!findService)
    return res.json({ success: false, message: "service not found " });

  return res.json({ success: true, message: "service deleted successfully" });
}
