const express = require("express");
const {
  getAllTeamMembers,
  getTeamMemberById,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  getTeamMembersByDepartment,
  toggleTeamMemberStatus,
} = require("../controllers/teamMemberController");
const authMiddleware = require("../middleware/authMiddleware");
const { checkRole } = require("../middleware/rbacMiddleware");
const { access } = require("../config/access");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Team Members
 *   description: Team member management
 */

/**
 * @swagger
 * /api/team-members:
 *   get:
 *     summary: Get all team members
 *     tags: [Team Members]
 *     parameters:
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by department
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of team members
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TeamMember'
 */
router.get("/", getAllTeamMembers);

/**
 * @swagger
 * /api/team-members/{id}:
 *   get:
 *     summary: Get team member by ID
 *     tags: [Team Members]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Team member details
 *       404:
 *         description: Team member not found
 */
router.get("/:id", getTeamMemberById);

/**
 * @swagger
 * /api/team-members/department/{department}:
 *   get:
 *     summary: Get team members by department
 *     tags: [Team Members]
 *     parameters:
 *       - in: path
 *         name: department
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Team members in department
 */
router.get("/department/:department", getTeamMembersByDepartment);

/**
 * @swagger
 * /api/team-members:
 *   post:
 *     summary: Create new team member
 *     tags: [Team Members]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - title
 *               - department
 *               - image
 *             properties:
 *               name:
 *                 type: string
 *                 description: Team member name
 *               title:
 *                 type: string
 *                 description: Team member title
 *               department:
 *                 type: string
 *                 description: Team member department
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Team member image
 *               bio:
 *                 type: string
 *                 description: Team member bio
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Team member email
 *               linkedin:
 *                 type: string
 *                 description: LinkedIn profile URL
 *               twitter:
 *                 type: string
 *                 description: Twitter profile URL
 *               order:
 *                 type: number
 *                 description: Display order
 *     responses:
 *       201:
 *         description: Team member created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post("/", authMiddleware, checkRole(access.manager), createTeamMember);

/**
 * @swagger
 * /api/team-members/{id}:
 *   put:
 *     summary: Update team member
 *     tags: [Team Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               title:
 *                 type: string
 *               department:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *               bio:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               linkedin:
 *                 type: string
 *               twitter:
 *                 type: string
 *               order:
 *                 type: number
 *     responses:
 *       200:
 *         description: Team member updated successfully
 *       404:
 *         description: Team member not found
 *       401:
 *         description: Unauthorized
 */
router.put("/:id", authMiddleware, checkRole(access.manager), updateTeamMember);

/**
 * @swagger
 * /api/team-members/{id}:
 *   delete:
 *     summary: Delete team member
 *     tags: [Team Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Team member deleted successfully
 *       404:
 *         description: Team member not found
 *       401:
 *         description: Unauthorized
 */
router.delete(
  "/:id",
  authMiddleware,
  checkRole(access.admin),
  deleteTeamMember
);

/**
 * @swagger
 * /api/team-members/{id}/toggle-status:
 *   patch:
 *     summary: Toggle team member active status
 *     tags: [Team Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Status toggled successfully
 *       404:
 *         description: Team member not found
 *       401:
 *         description: Unauthorized
 */
router.patch(
  "/:id/toggle-status",
  authMiddleware,
  checkRole(access.manager),
  toggleTeamMemberStatus
);

module.exports = router;
