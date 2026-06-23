import mongoose from "mongoose";

const supportTicketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["Shipment Issue", "Tracking Issue", "Pickup Issue", "Billing Issue", "Account Issue", "Other"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved", "Closed"],
      default: "Open",
    },
    description: {
      type: String,
      required: true,
    },
    messages: [
      {
        sender: {
          type: String,
          required: true, // "Seller" or "Support"
        },
        content: {
          type: String,
          required: true,
        },
        time: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

supportTicketSchema.index({ ticketId: 1 });
supportTicketSchema.index({ status: 1 });

const SupportTicket = mongoose.model("SupportTicket", supportTicketSchema);
export default SupportTicket;
