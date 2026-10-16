import Contact from "../models/Contact.js";

// Submit contact message (Guest/User)
export const submitContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "Name, email, and message parameters are required" });
    }

    const newMessage = await Contact.create({
      name,
      email,
      message,
    });

    res.status(201).json({ message: "Support ticket recorded. Phreight team alerted.", newMessage });
  } catch (error) {
    res.status(500).json({ message: "Error submitting support request", error: error.message });
  }
};

// View contact messages (Admin/Mod)
export const getContacts = async (req, res) => {
  try {
    const messages = await Contact.find({}).sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving support messages", error: error.message });
  }
};

// Update contact reply/status (Admin/Mod)
export const updateContactReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reply } = req.body;

    let contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({ message: "Inquiry not found" });
    }

    contact.status = status || contact.status;
    contact.reply = reply !== undefined ? reply : contact.reply;

    await contact.save();

    res.status(200).json({ message: "Inquiry updated successfully", contact });
  } catch (error) {
    res.status(500).json({ message: "Error updating inquiry reply", error: error.message });
  }
};
