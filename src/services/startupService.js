const cleanupService = require("./cleanupService");
const logger = require("./logger");

/**
 * Startup Service
 * Initializes all production services like cleanup and monitoring.
 */
class StartupService {
  constructor() {
    this.services = new Map();
    this.isInitialized = false;
  }

  /**
   * Initialize all production services
   */
  async initialize() {
    if (this.isInitialized) {
      logger.warn("Startup service already initialized");
      return;
    }

    try {
      logger.info("Starting production services initialization...");

      // Initialize cleanup service
      await this.initializeCleanupService();

      // Add more services here as needed
      // await this.initializeMonitoringService();
      // await this.initializeSecurityService();

      this.isInitialized = true;
      logger.info("All production services initialized successfully");
    } catch (error) {
      logger.error(
        `Failed to initialize production services: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * Initialize cleanup service
   */
  async initializeCleanupService() {
    try {
      // Start cleanup service with 60-minute interval
      cleanupService.start(60);

      this.services.set("cleanup", {
        name: "Cleanup Service",
        status: "running",
        interval: "60 minutes",
      });

      logger.info("Cleanup service initialized");
    } catch (error) {
      logger.error(`Failed to initialize cleanup service: ${error.message}`);
      throw error;
    }
  }

  /**
   * Gracefully shutdown all services
   */
  async shutdown() {
    try {
      logger.info("Shutting down production services...");

      // Stop cleanup service
      if (this.services.has("cleanup")) {
        cleanupService.stop();
        this.services.get("cleanup").status = "stopped";
        logger.info("Cleanup service stopped");
      }

      this.isInitialized = false;
      logger.info("All production services shut down successfully");
    } catch (error) {
      logger.error(`Error during service shutdown: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get service status
   * @returns {Object} Status of all services
   */
  getStatus() {
    const status = {
      isInitialized: this.isInitialized,
      services: {},
    };

    for (const [key, service] of this.services) {
      status.services[key] = {
        name: service.name,
        status: service.status,
        interval: service.interval,
      };
    }

    return status;
  }

  /**
   * Force cleanup (for testing or manual intervention)
   */
  async forceCleanup() {
    try {
      await cleanupService.forceCleanup();
      logger.info("Force cleanup completed");
    } catch (error) {
      logger.error(`Force cleanup failed: ${error.message}`);
      throw error;
    }
  }
}

// Create singleton instance
const startupService = new StartupService();

module.exports = startupService;
