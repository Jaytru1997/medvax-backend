const express = require("express");
const { checkRole } = require("../middleware/rbacMiddleware");
const {
  getMedications,
  getMedicationById,
  addMedication,
  updateMedication,
  deleteMedication,
} = require("../controllers/medicationController");
const authMiddleware = require("../middleware/authMiddleware");
const { access } = require("../config/access");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Medications
 *   description: Medications management
 */

/**
 *  @swagger
 * /api/medications:
 *   get:
 *     summary: Get all medications
 *     tags: [Medications]
 *     description: Fetch all medications from the database.
 *     responses:
 *       200:
 *         description: Medications retrieved successfully
 *       500:
 *         description: Server error
 */
router.get("/", getMedications);

/**
 *  @swagger
 * /api/medications/{id}:
 *   get:
 *     summary: Get medication by ID
 *     tags: [Medications]
 *     description: Fetch a medication from the database using the ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the medication
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Medication retrieved successfully
 *       404:
 *         description: Medication not found
 *       500:
 *         description: Server error
 */
router.get("/:id", getMedicationById);

/**
 *  @swagger
 * /api/medications:
 *   post:
 *     summary: Add a new medication
 *     tags: [Medications]
 *     description: Add a new medication to the database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       201:
 *         description: Medication added successfully
 *       400:
 *         description: All fields are required
 *       500:
 *         description: Server error
 */
router.post("/", authMiddleware, checkRole(access.admin), addMedication);

/**
 * @swagger
 * /api/medications/{id}:
 *   put:
 *     summary: Update medication
 *     tags: [Medications]
 *     description: Update medication in the database.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the medication
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Medication updated successfully
 *       400:
 *         description: All fields are required
 *       500:
 *         description: Server error
 */
router.put("/:id", authMiddleware, checkRole(access.admin), updateMedication);

/**
 * @swagger
 * /api/medications/{id}:
 *   delete:
 *     summary: Delete medication
 *     tags: [Medications]
 *     description: Delete medication from the database.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the medication
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Medication deleted successfully
 *       500:
 *         description: Server error
 */
router.delete(
  "/:id",
  authMiddleware,
  checkRole(access.admin),
  deleteMedication
);

module.exports = router;
