import { Project } from "../models/projects.js";

export async function getProjects(req, res) {
  const findProjects = await Project.find();
  if (findProjects.length === 0)
    return res.json({
      code: 200,
      success: false,
      message: "Projects not added yet",
    });
  res.json({
    status: 200,
    success: true,
    message: "All Projects sended",
    projects: findProjects,
  });
}
export async function addProject(req, res) {
  const {
    title,
    slug,
    description,
    types,
    technologies,
    image,
    gallery,
    liveUrl,
    githubUrl,
    client,
    featured,
    createdAt,
  } = req.body || {};

  if (
    !title ||
    !slug ||
    !description ||
    !types?.length ||
    !technologies?.length ||
    !image ||
    !gallery?.length ||
    !liveUrl ||
    !githubUrl ||
    !client ||
    featured === undefined
  )
    return res.json({ success: false, message: "All fields are required" });

  const existingProject = await Project.findOne({ title });
  if (existingProject)
    return res.json({ success: false, message: "This project already exist" });

  const newProject = await Project.create({
    title,
    slug,
    description,
    types,
    technologies,
    image,
    gallery,
    liveUrl,
    githubUrl,
    client,
    featured,
    createdAt,
  });
  res.json({ success: true, message: "project added", newProject });
}

export async function editProject(req, res) {
  const {
    title,
    slug,
    description,
    types,
    technologies,
    image,
    gallery,
    liveUrl,
    githubUrl,
    client,
    featured,
    createdAt,
  } = req.body || {};
  const { id } = req.params || {};
  if (!id) return res.json({ success: false, message: "project id required" });

  const findProject = await Project.findById(id);
  if (!findProject)
    return res.json({ succes: false, message: "Project not found" });

  const existingProject = await Project.findOne({
    $or: [{ title }, { slug }],
    _id: { $ne: id }, // exclude current project
  });

  if (existingProject)
    return res.json({
      success: false,
      message: "A project with the same title or slug already exists",
    });

  const updateProject = await Project.findByIdAndUpdate(
    { _id: id },
    {
      title,
      slug,
      description,
      types,
      technologies,
      image,
      gallery,
      liveUrl,
      githubUrl,
      client,
      featured,
      createdAt,
    },
    { new: true }
  );
  res.json({ success: true, message: "Project updated", updateProject });
}

export async function deleteProject(req, res) {
  const { id } = req.params || {};
  if (!id)
    return res.json({
      statsCode: 500,
      success: false,
      message: "Id is required fr delete this project",
    });

  const findProject = await Project.findByIdAndDelete(id);
  if (!findProject)
    return res.json({
      status: 404,
      success: false,
      message: "Project not found",
    });

  res.json({
    status: 200,
    success: true,
    message: "this project has been deleted",
  });
}
