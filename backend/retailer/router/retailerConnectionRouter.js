import express from "express";
import retailerAuth from "../middleware/authMiddleware.js";
import {
  getAllDistributors,
  getConnectedDistributors,
  sendConnectionRequest,
  getConnectionStatus,
  // getPendingRequests,
  disconnectDistributor
} from "../controller/retailerConnectionsApi.js"
const retailerConnectionsRouter = express.Router();

// Retailer-only routes
retailerConnectionsRouter.get("/distributors", retailerAuth, getAllDistributors);
retailerConnectionsRouter.get("/connected-distributors", retailerAuth, getConnectedDistributors);
retailerConnectionsRouter.post("/request", retailerAuth, sendConnectionRequest);
retailerConnectionsRouter.post("/disconnect/:distributorId", retailerAuth, disconnectDistributor);

// Shared (retailer can check status with distributor)
retailerConnectionsRouter.get(
  "/status/:retailerId/:distributorId",
  retailerAuth,
  getConnectionStatus
);

export default retailerConnectionsRouter;
