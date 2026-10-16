import express from "express";
import {
  createTicket,
  getMyTickets,
  getAllTickets,
  replyTicket,
  updateTicketStatus,
  createClaim,
  getMyClaims,
  getAllClaims,
  resolveClaim,
} from "../controllers/ticketController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

// Tickets (Seller operations)
router.post("/ticket", createTicket);
router.get("/my-tickets", getMyTickets);
router.post("/ticket/:id/reply", replyTicket);

// Tickets (Admin / Operations)
router.get("/admin/tickets", roleMiddleware("Admin", "Moderator", "Operations"), getAllTickets);
router.put("/admin/ticket/:id/status", roleMiddleware("Admin", "Moderator", "Operations"), updateTicketStatus);

// Claims (Seller operations)
router.post("/claim", createClaim);
router.get("/my-claims", getMyClaims);

// Claims (Admin / Operations)
router.get("/admin/claims", roleMiddleware("Admin", "Moderator", "Operations"), getAllClaims);
router.put("/admin/claim/:id/resolve", roleMiddleware("Admin", "Moderator", "Operations"), resolveClaim);

export default router;
