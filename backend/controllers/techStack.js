import { TechStack } from "../models/techStack.js";


export async function getTechStacks(req, res) {
  const stacks = await TechStack.find();
  if (stacks.length === 0)
    return res.json({ success: true, message: "no tech stack added yet" });
  res.json({
    success: true,
    message: "all tech stacks are sent",
    techStacks: stacks,
  });
}

export async function addTechStack(req, res) {
  const { name, category, icon, level, description, active, order } =
    req.body || {};
  if (!name)
    return res.json({ success: false, message: "tech stack name is required" });
  const existing = await TechStack.findOne({ name });
  if (existing)
    return res.json({
      success: false,
      message: "this tech stack already exists",
    });
  const newStack = await TechStack.create({
    name,
    category,
    icon,
    level,
    description,
    active,
    order,
  });
  res.json({ success: true, message: "new tech stack added", newStack });
}

export async function editTechStack(req, res) {
  const { id } = req.params || {};
  const { name, category, icon, level, description, active, order } =
    req.body || {};
  if (!id)
    return res.json({
      success: false,
      message: "tech stack id is required for update",
    });
  if (!name)
    return res.json({ success: false, message: "tech stack name is required" });
  const updated = await TechStack.findByIdAndUpdate(
    { _id: id },
    { name, category, icon, level, description, active, order },
    { new: true }
  );
  if (!updated)
    return res.json({ success: false, message: "tech stack not found" });
  res.json({ success: true, message: "tech stack updated", updated });
}

export async function deleteTechStack(req, res) {
  const { id } = req.params || {};
  if (!id)
    return res.json({
      success: false,
      message: "tech stack id is required for delete",
    });
  const deleted = await TechStack.findByIdAndDelete(id);
  if (!deleted)
    return res.json({ success: false, message: "tech stack not found" });
  res.json({ success: true, message: "tech stack deleted" });
}
