import { Faq } from "../models/faqs.js";

export async function getFaqs(req, res) {
  try {
    const faqs = await Faq.find();
    if (faqs.length === 0) {
      return res.json({
        success: true,
        message: "No FAQs available",
        faqs: [],
      });
    }

    res.json({ success: true, message: "FAQs retrieved", faqs });
  } catch (error) {
    console.error("Failed to fetch FAQs:", error);
    res
      .status(500)
      .json({ success: false, message: "Unable to fetch FAQs at this time" });
  }
}

export async function addFaq(req, res) {
  try {
    const { question, answer, category, order, active } = req.body || {};

    if (!question || !answer) {
      return res
        .status(400)
        .json({ success: false, message: "Question and answer are required" });
    }

    const existingFaq = await Faq.findOne({ question });
    if (existingFaq) {
      return res
        .status(409)
        .json({ success: false, message: "FAQ already exists" });
    }

    const newFaq = await Faq.create({
      question,
      answer,
      category,
      order,
      active,
    });

    res
      .status(201)
      .json({ success: true, message: "FAQ created", faq: newFaq });
  } catch (error) {
    console.error("Failed to add FAQ:", error);
    res
      .status(500)
      .json({ success: false, message: "Unable to add FAQ at this time" });
  }
}

export async function editFaq(req, res) {
  try {
    const { question, answer, category, order, active } = req.body || {};
    const { id } = req.params || {};

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "FAQ id is required" });
    }

    if (!question || !answer) {
      return res
        .status(400)
        .json({ success: false, message: "Question and answer are required" });
    }

    const duplicateFaq = await Faq.findOne({
      question,
      _id: { $ne: id },
    });

    if (duplicateFaq) {
      return res
        .status(409)
        .json({ success: false, message: "FAQ with this question exists" });
    }

    const editedFaq = await Faq.findByIdAndUpdate(
      id,
      { question, answer, category, order, active },
      { new: true }
    );

    if (!editedFaq) {
      return res.status(404).json({ success: false, message: "FAQ not found" });
    }

    res.json({ success: true, message: "FAQ updated", faq: editedFaq });
  } catch (error) {
    console.error("Failed to edit FAQ:", error);
    res
      .status(500)
      .json({ success: false, message: "Unable to edit FAQ at this time" });
  }
}

export async function deleteFaq(req, res) {
  try {
    const { id } = req.params || {};

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "FAQ id is required" });
    }

    const deletedFaq = await Faq.findByIdAndDelete(id);
    if (!deletedFaq) {
      return res.status(404).json({ success: false, message: "FAQ not found" });
    }

    res.json({ success: true, message: "FAQ deleted" });
  } catch (error) {
    console.error("Failed to delete FAQ:", error);
    res
      .status(500)
      .json({ success: false, message: "Unable to delete FAQ at this time" });
  }
}
