import express from "express";
import RecipientCustomersController from "../controllers/RecipientCustomersController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", RecipientCustomersController.list);
router.get("/list-for-drop-down", RecipientCustomersController.listForDropDown);
router.post("/", RecipientCustomersController.create);
router.put("/:id", RecipientCustomersController.update);
router.delete("/:id", RecipientCustomersController.remove);

export default router;