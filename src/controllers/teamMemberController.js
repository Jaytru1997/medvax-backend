const TeamMember = require("../models/TeamMember");
const { asyncWrapper } = require("../utils/async");
const logger = require("../services/logger");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

/**
 * Get all team members
 */
exports.getAllTeamMembers = asyncWrapper(async (req, res) => {
  try {
    const { department, active } = req.query;

    let query = {};

    // Filter by department if provided
    if (department) {
      query.department = department;
    }

    // Filter by active status if provided
    if (active !== undefined) {
      query.isActive = active === "true";
    }

    const teamMembers = await TeamMember.find(query).sort({
      order: 1,
      createdAt: -1,
    });

    logger.info(`Retrieved ${teamMembers.length} team members`);

    res.status(200).json({
      success: true,
      count: teamMembers.length,
      data: teamMembers,
    });
  } catch (error) {
    logger.error(`Error getting team members: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Error retrieving team members",
    });
  }
});

/**
 * Get team member by ID
 */
exports.getTeamMemberById = asyncWrapper(async (req, res) => {
  try {
    const { id } = req.params;

    const teamMember = await TeamMember.findById(id);

    if (!teamMember) {
      return res.status(404).json({
        success: false,
        error: "Team member not found",
      });
    }

    logger.info(`Retrieved team member: ${teamMember.name}`);

    res.status(200).json({
      success: true,
      data: teamMember,
    });
  } catch (error) {
    logger.error(`Error getting team member by ID: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Error retrieving team member",
    });
  }
});

/**
 * Create new team member
 */
exports.createTeamMember = asyncWrapper(async (req, res) => {
  try {
    const { name, position, department, bio, email, linkedin, twitter, order } =
      req.body;

    // Handle file upload
    let imageUrl = "";
    if (req.files && req.files.image) {
      const file = req.files.image;

      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          error: "Only JPEG, PNG, and WebP images are allowed",
        });
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          error: "Image size must be less than 5MB",
        });
      }

      // Generate unique filename
      const fileName = `team-member-${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}${path.extname(file.name)}`;
      const uploadPath = path.join(
        __dirname,
        "../../public/uploads/team-members",
        fileName
      );

      // Ensure directory exists
      const uploadDir = path.dirname(uploadPath);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Move file to uploads directory
      await file.mv(uploadPath);
      imageUrl = `https://${process.env.URL}/uploads/team-members/${fileName}`;

      logger.info(`Image uploaded for team member: ${fileName}`);
    } else {
      return res.status(400).json({
        success: false,
        error: "Image is required",
      });
    }

    const teamMember = new TeamMember({
      name,
      position,
      image: imageUrl,
      department,
      bio,
      email,
      linkedin,
      twitter,
      order: order || 0,
    });

    await teamMember.save();

    logger.info(`Created new team member: ${teamMember.name}`);

    res.status(201).json({
      success: true,
      data: teamMember,
    });
  } catch (error) {
    logger.error(`Error creating team member: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Error creating team member",
    });
  }
});

/**
 * Update team member
 */
exports.updateTeamMember = asyncWrapper(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    const teamMember = await TeamMember.findById(id);

    if (!teamMember) {
      return res.status(404).json({
        success: false,
        error: "Team member not found",
      });
    }

    // Handle file upload if new image is provided
    if (req.files && req.files.image) {
      const file = req.files.image;

      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          error: "Only JPEG, PNG, and WebP images are allowed",
        });
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          error: "Image size must be less than 5MB",
        });
      }

      // Delete old image if it exists
      if (
        teamMember.image &&
        teamMember.image !== "/uploads/team-members/default.jpg"
      ) {
        const oldImagePath = path.join(
          __dirname,
          "../../public",
          teamMember.image
        );
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // Generate unique filename
      const fileName = `team-member-${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}${path.extname(file.name)}`;
      const uploadPath = path.join(
        __dirname,
        "../../public/uploads/team-members",
        fileName
      );

      // Ensure directory exists
      const uploadDir = path.dirname(uploadPath);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Move file to uploads directory
      await file.mv(uploadPath);
      updateData.image = `https://${process.env.URL}/uploads/team-members/${fileName}`;

      logger.info(`Image updated for team member: ${fileName}`);
    }

    const updatedTeamMember = await TeamMember.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    logger.info(`Updated team member: ${updatedTeamMember.name}`);

    res.status(200).json({
      success: true,
      data: updatedTeamMember,
    });
  } catch (error) {
    logger.error(`Error updating team member: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Error updating team member",
    });
  }
});

/**
 * Delete team member
 */
exports.deleteTeamMember = asyncWrapper(async (req, res) => {
  try {
    const { id } = req.params;

    const teamMember = await TeamMember.findById(id);

    if (!teamMember) {
      return res.status(404).json({
        success: false,
        error: "Team member not found",
      });
    }

    // Delete associated image file
    if (
      teamMember.image &&
      teamMember.image !== "/uploads/team-members/default.jpg"
    ) {
      const imagePath = path.join(__dirname, "../../public", teamMember.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await TeamMember.findByIdAndDelete(id);

    logger.info(`Deleted team member: ${teamMember.name}`);

    res.status(200).json({
      success: true,
      message: "Team member deleted successfully",
    });
  } catch (error) {
    logger.error(`Error deleting team member: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Error deleting team member",
    });
  }
});

/**
 * Get team members by department
 */
exports.getTeamMembersByDepartment = asyncWrapper(async (req, res) => {
  try {
    const { department } = req.params;

    const teamMembers = await TeamMember.find({
      department,
      isActive: true,
    }).sort({ order: 1, createdAt: -1 });

    logger.info(
      `Retrieved ${teamMembers.length} team members from department: ${department}`
    );

    res.status(200).json({
      success: true,
      count: teamMembers.length,
      department,
      data: teamMembers,
    });
  } catch (error) {
    logger.error(`Error getting team members by department: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Error retrieving team members by department",
    });
  }
});

/**
 * Toggle team member active status
 */
exports.toggleTeamMemberStatus = asyncWrapper(async (req, res) => {
  try {
    const { id } = req.params;

    const teamMember = await TeamMember.findById(id);

    if (!teamMember) {
      return res.status(404).json({
        success: false,
        error: "Team member not found",
      });
    }

    teamMember.isActive = !teamMember.isActive;
    await teamMember.save();

    logger.info(
      `Toggled status for team member: ${teamMember.name} to ${
        teamMember.isActive ? "active" : "inactive"
      }`
    );

    res.status(200).json({
      success: true,
      data: teamMember,
    });
  } catch (error) {
    logger.error(`Error toggling team member status: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Error updating team member status",
    });
  }
});
