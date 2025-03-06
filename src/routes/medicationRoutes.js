const express = require("express");
const { getMedications, getMedicationById, addMedication, updateMedication, deleteMedication } = require("../controllers/medicationController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getMedications);
router.get("/:id", getMedicationById);
router.post("/", authMiddleware, addMedication);
router.put("/:id", authMiddleware, updateMedication);
router.delete("/:id", authMiddleware, deleteMedication);

module.exports = router;
