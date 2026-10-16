import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    stars: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      default: 5,
    },
  },
  {
    timestamps: true,
  }
);

const Testimonial = mongoose.model("Testimonial", testimonialSchema);
export default Testimonial;
