import PageContent from "../models/PageContent.js";

// Retrieve content for a specific page (Public)
export const getPageContent = async (req, res) => {
  try {
    const { page } = req.params;
    const content = await PageContent.findOne({ page });
    if (!content) {
      return res.status(404).json({ message: `Page content for '${page}' not found` });
    }
    res.status(200).json(content);
  } catch (error) {
    res.status(500).json({ message: "Error fetching page content", error: error.message });
  }
};

// Update content for a specific page (Admin only)
export const updatePageContent = async (req, res) => {
  try {
    const { page } = req.params;
    const { sections } = req.body;

    if (!sections) {
      return res.status(400).json({ message: "Sections data is required" });
    }

    let content = await PageContent.findOne({ page });
    if (!content) {
      content = await PageContent.create({ page, sections });
    } else {
      content.sections = sections;
      // Mark as modified if Mongoose doesn't auto-detect Mixed changes
      content.markModified("sections");
      await content.save();
    }

    res.status(200).json({ message: `Page content for '${page}' updated successfully`, content });
  } catch (error) {
    res.status(500).json({ message: "Error updating page content", error: error.message });
  }
};
