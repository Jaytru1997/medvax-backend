const express = require("express");
const {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
} = require("../controllers/blogController");
const authMiddleware = require("../middleware/authMiddleware");
const { checkRole } = require("../middleware/rbacMiddleware");
const { access } = require("../config/access");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Blog
 *   description: Blog management and articles
 */

/**
 * @swagger
 * /api/blog:
 *   get:
 *     summary: Get all blog posts
 *     tags: [Blog]
 *     parameters:
 *       - in: query
 *         name: lang
 *         schema:
 *           type: string
 *         description: Filter blogs by language (e.g., en, fr, es)
 *     responses:
 *       200:
 *         description: List of all blog posts
 *       500:
 *         description: Server error
 */
router.get("/", getAllPosts);

/**
 * @swagger
 * /api/blog/{id}:
 *   get:
 *     summary: Get a single blog post by ID
 *     tags: [Blog]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog post ID
 *     responses:
 *       200:
 *         description: The blog post data
 *       404:
 *         description: Blog post not found
 *       500:
 *         description: Server error
 */
router.get("/:id", getPostById);

/**
 * @swagger
 * /api/blog:
 *   post:
 *     summary: Create a new blog post
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               category:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               banner:
 *                 type: string
 *                 description: Banner image URL
 *               language:
 *                 type: string
 *                 description: Language code (e.g., en, fr, es)
 *     responses:
 *       201:
 *         description: Blog post created
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/", authMiddleware, checkRole(access.manager), createPost);

/**
 * @swagger
 * /api/blog/{id}:
 *   put:
 *     summary: Update a blog post
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               language:
 *                 type: string
 *                 description: Language code (e.g., en, fr, es)
 *     responses:
 *       200:
 *         description: Blog post updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Blog post not found
 *       500:
 *         description: Server error
 */
router.put("/:id", authMiddleware, checkRole(access.manager), updatePost);

/**
 * @swagger
 * /api/blog/{id}:
 *   delete:
 *     summary: Delete a blog post
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog post ID
 *     responses:
 *       200:
 *         description: Blog post deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Blog post not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", authMiddleware, checkRole(access.manager), deletePost);

module.exports = router;
