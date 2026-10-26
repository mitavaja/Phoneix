import PageContent from "../models/PageContent.js";
import { defaultCmsContent } from "../utils/defaultCmsContent.js";

// Retrieve content for a specific page (Public)
export const getPageContent = async (req, res) => {
  try {
    const { page } = req.params;
    let content = await PageContent.findOne({ page });
    if (!content) {
      if (defaultCmsContent[page]) {
        content = await PageContent.create({ page, sections: defaultCmsContent[page] });
        return res.status(200).json(content);
      }
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

    const content = await PageContent.findOneAndUpdate(
      { page },
      {
        $set: {
          sections,
          updatedAt: new Date()
        },
        $setOnInsert: {
          createdAt: new Date()
        }
      },
      { new: true, upsert: true, runValidators: false }
    );

    res.status(200).json({ message: `Page content for '${page}' updated successfully`, content });
  } catch (error) {
    res.status(500).json({ message: "Error updating page content", error: error.message });
  }
};
