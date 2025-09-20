// controller/partiesController.js
import Party from "../../../database/models/Party.js"; 

// ✅ Get all parties for authenticated distributor
export const getParties = async (req, res) => {
  try {
    const distributorId = req.user.distributor_id; // 👈 from auth middleware

    const parties = await Party.findAll({
      attributes: [
        "party_id",
        "code",
        "name",
        "dl_no",
        "gstin",
        "contact_person",
        "mobile",
        "email",
        "area",
        "city",
        "district",
        "pincode",
        "credit_limit",
        "type",
        "is_active",
        "created_at"
      ],
      where: { distributor_id: distributorId }, // 👈 only distributor’s parties
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: parties.length,
      data: parties,
    });
  } catch (error) {
    console.error("Error fetching parties:", error);
    res.status(500).json({
      success: false,
      message: "Server Error: Could not fetch parties",
    });
  }
};

// ✅ Add a new party for authenticated distributor
export const addParty = async (req, res) => {
  try {
    const distributorId = req.user.distributor_id; // 👈 from auth middleware

    const {
      partyCode,
      partyName,
      dlNo,
      gstin,
      contactPerson,
      mobile,
      email,
      area,
      city,
      district,
      pincode,
      creditLimit,
      type = "Customer",
    } = req.body;

    if (!partyName || !partyCode) {
      return res.status(400).json({
        success: false,
        message: "Party name and code are required",
      });
    }

    // Prevent duplicate for same distributor
    const existingParty = await Party.findOne({
      where: { code: partyCode, distributor_id: distributorId },
    });
    if (existingParty) {
      return res.status(400).json({
        success: false,
        message: "Party with this code already exists for your account",
      });
    }

    const newParty = await Party.create({
      code: partyCode,
      name: partyName,
      dl_no: dlNo,
      gstin,
      contact_person: contactPerson,
      mobile,
      email,
      area,
      city,
      district,
      pincode,
      credit_limit: parseFloat(creditLimit) || 0,
      type,
      is_active: true,
      distributor_id: distributorId, // 👈 link to distributor
    });

    res.status(201).json({
      success: true,
      message: "Party added successfully",
      data: newParty,
    });
  } catch (error) {
    console.error("Error adding party:", error);
    res.status(500).json({
      success: false,
      message: "Server Error: Could not add party",
    });
  }
};
