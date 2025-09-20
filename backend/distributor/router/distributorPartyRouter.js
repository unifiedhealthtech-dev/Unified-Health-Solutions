// routes/parties.js
import {Router} from "express";
import distributorAuth from "../middleware/authMiddleware.js"; // Reusable auth
import { getParties, addParty } from "../controller/partiesController.js";

const distributorPartyRouter = Router();

// GET /api/parties → Get all parties (protected)
distributorPartyRouter.get("/", distributorAuth, getParties);

// POST /api/parties → Add new party (protected)
distributorPartyRouter.post("/", distributorAuth, addParty);

export default distributorPartyRouter;