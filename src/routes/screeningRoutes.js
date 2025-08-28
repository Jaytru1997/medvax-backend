const express = require("express");
const { checkRole } = require("../middleware/rbacMiddleware");
const {
  createScreening,
  getScreeningById,
  updateScreening,
  addScreeningDetails,
  deleteScreening,
  getAllScreenings,
} = require("../controllers/screeningController");
const authMiddleware = require("../middleware/authMiddleware");
const { access } = require("../config/access");

const router = express.Router();

router.post("/", createScreening);
router.get("/", authMiddleware, checkRole(access.admin), getAllScreenings);
router.get("/:id", authMiddleware, checkRole(access.admin), getScreeningById);
router.put("/:id", authMiddleware, checkRole(access.admin), updateScreening);
router.post(
  "/:id/details",
  authMiddleware,
  checkRole(access.admin),
  addScreeningDetails
);

router.delete("/:id", authMiddleware, checkRole(access.admin), deleteScreening);

module.exports = router;
