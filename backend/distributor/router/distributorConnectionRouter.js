// routes/distributorConnections.js
import express from "express";
import distributorAuth from "../middleware/authMiddleware.js"; // Reusable
import {
  getConnectionRequests,
  getConnectedRetailers,
  acceptConnectionRequest,
  rejectConnectionRequest,
} from "../controller/distributorConnectionsApi.js";

const distributorConnectionsRouter = express.Router();

// Use relative paths without /connections prefix in route definition
// Because we'll mount this under /api/distributor/connections

distributorConnectionsRouter.get("/requests", distributorAuth, getConnectionRequests);
distributorConnectionsRouter.get("/connected", distributorAuth, getConnectedRetailers);
distributorConnectionsRouter.post("/accept/:requestId", distributorAuth, acceptConnectionRequest);
distributorConnectionsRouter.post("/reject/:requestId", distributorAuth, rejectConnectionRequest);

export default distributorConnectionsRouter;