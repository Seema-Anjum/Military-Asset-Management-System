// Rescrict access based on user roles
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: "Access Denied: Insufficient authorization level." 
      });
    }
    next();
  };
};

//  Base Commanders can ONLY view/manage their assigned base
export const enforceBaseScope = (req, res, next) => {
  if (req.user.role === 'BASE_COMMANDER') {
    if (!req.user.baseId) {
      return res.status(400).json({ message: "Base Commander has no assigned base ID." });
    }
    req.scopedBaseId = req.user.baseId;
  } else {
    
    // Admin & Logistics Officers can filter by query parameter, or view globally if null
    req.scopedBaseId = req.query.baseId ? parseInt(req.query.baseId, 10) : null;
  }
  next();
};