export const getDashboardSummary = async (req, res) => {
  try {
    // TODO: Replace with actual DB queries
    const stats = {
      todaySales: 245678,
      salesChange: "+12.5%",
      pendingOrders: 147,
      orderChange: "-8 from yesterday",
      totalProducts: 2847,
      lowStockItems: 23,
      activeParties: 156,
      partyChange: "+3 new this week",
      collectionsDue: 456789,
      paymentsDue: 234567,
      netOutstanding: 222222
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc Get recent orders
export const getRecentOrders = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // TODO: Replace with actual DB query
    const orders = [
      { id: 1, orderId: "ORD-001", partyName: "Apollo Pharmacy", totalAmount: 45678, status: "Processing", updatedAt: "2 hours ago" },
      { id: 2, orderId: "ORD-002", partyName: "MedPlus Store", totalAmount: 23456, status: "Delivered", updatedAt: "4 hours ago" },
      { id: 3, orderId: "ORD-003", partyName: "Guardian Pharmacy", totalAmount: 67890, status: "Pending", updatedAt: "6 hours ago" },
      { id: 4, orderId: "ORD-004", partyName: "Wellness Store", totalAmount: 12345, status: "Processing", updatedAt: "1 day ago" }
    ].slice(0, limit);

    res.json({ data: orders, total: orders.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};