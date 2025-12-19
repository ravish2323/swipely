/**
 * Config plugin for SMS permissions
 * Note: Permissions are already in app.json, this plugin ensures they're included in the build
 */
module.exports = (config) => {
  // Permissions are handled in app.json
  // This plugin can be extended if needed for additional native configuration
  return config;
};

