/**
 * 🛡️ Role-Based Access Control (RBAC) Gatekeeper Middleware
 * Closes over allowed role IDs and checks them against the authenticated user context.
 * * @param {...string} allowedRoles - List of authorized role IDs (e.g., 'r1', 'r2', 'r4')
 */
const rbac = function (...allowedRoles) {
  return (req, res, next) => {
    // 1. Fail Securely: If the auth middleware was skipped or failed to populate req.user
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized. Authentication context missing."
      });
    }

    const userRole = req.user.roleId;

    // 2. Fail Securely: Handle an undefined or missing roleId property to prevent edge-case bypasses
    if (!userRole) {
      return res.status(403).json({
        message: "Forbidden. User profile has no explicit role assigned."
      });
    }

    // 3. Authorization Check: Match against permission strings allowed on this specific endpoint
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        message: `Forbidden. Your role tier (${userRole}) is unauthorized to perform this action.`
      });
    }

    // ✅ User is authorized! Pass execution down to the next controller handler
    next();
  };
};

export default rbac;