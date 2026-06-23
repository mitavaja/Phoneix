import mongoose from "mongoose";

const pageContentSchema = new mongoose.Schema(
  {
    page: {
      type: String,
      required: true,
      unique: true,
    },
    sections: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const PageContent = mongoose.model("PageContent", pageContentSchema);
export default PageContent;
