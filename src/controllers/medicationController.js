const Medication = require("../models/Medication");
const { asyncWrapper } = require("../utils/async");

// Get all medications (with optional filters)
exports.getMedications = asyncWrapper(async (req, res) => {
  try {
    const { category, minPrice, maxPrice } = req.query;
    let filter = {};

    if (category) filter.category = category;
    if (minPrice) filter.price = { $gte: minPrice };
    if (maxPrice) filter.price = { ...filter.price, $lte: maxPrice };

    const medications = await Medication.find(filter);
    res.json(medications);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get a single medication by ID
exports.getMedicationById = asyncWrapper(async (req, res) => {
  try {
    const medication = await Medication.findById(req.params.id);
    if (!medication)
      return res.status(404).json({ message: "Medication not found" });

    res.json(medication);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Add new medication (Admin only)
exports.addMedication = asyncWrapper(async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { name, category, price, description, stock } = req.body;

    const medication = new Medication({
      name,
      category,
      price,
      description,
      stock,
      createdBy: req.user.id,
    });

    await medication.save();
    res
      .status(201)
      .json({ message: "Medication added successfully", medication });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update medication (Admin only)
exports.updateMedication = asyncWrapper(async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const medication = await Medication.findById(req.params.id);
    if (!medication)
      return res.status(404).json({ message: "Medication not found" });

    Object.assign(medication, req.body);
    await medication.save();

    res.json({ message: "Medication updated", medication });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete medication (Admin only)
exports.deleteMedication = asyncWrapper(async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const medication = await Medication.findByIdAndDelete(req.params.id);
    if (!medication)
      return res.status(404).json({ message: "Medication not found" });

    res.json({ message: "Medication deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
