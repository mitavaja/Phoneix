import Testimonial from "../models/Testimonial.js";

// @desc    Get all testimonials
// @route   GET /api/testimonials
// @access  Public
export const getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.status(200).json(testimonials);
  } catch (error) {
    res.status(500).json({ message: "Error fetching testimonials", error: error.message });
  }
};

// @desc    Create new testimonial
// @route   POST /api/testimonials
// @access  Private/Admin
export const createTestimonial = async (req, res) => {
  try {
    const { name, description, stars } = req.body;
    if (!name || !description || !stars) {
      return res.status(400).json({ message: "Please provide all required fields: name, description, stars" });
    }

    const testimonial = await Testimonial.create({
      name,
      description,
      stars: Number(stars),
    });

    res.status(201).json({ message: "Testimonial created successfully", testimonial });
  } catch (error) {
    res.status(500).json({ message: "Error creating testimonial", error: error.message });
  }
};

// @desc    Update testimonial
// @route   PUT /api/testimonials/:id
// @access  Private/Admin
export const updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, stars } = req.body;

    let testimonial = await Testimonial.findById(id);
    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    testimonial.name = name || testimonial.name;
    testimonial.description = description || testimonial.description;
    testimonial.stars = stars !== undefined ? Number(stars) : testimonial.stars;

    await testimonial.save();

    res.status(200).json({ message: "Testimonial updated successfully", testimonial });
  } catch (error) {
    res.status(500).json({ message: "Error updating testimonial", error: error.message });
  }
};

// @desc    Delete testimonial
// @route   DELETE /api/testimonials/:id
// @access  Private/Admin
export const deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    const testimonial = await Testimonial.findById(id);
    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    await testimonial.deleteOne();

    res.status(200).json({ message: "Testimonial deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting testimonial", error: error.message });
  }
};
