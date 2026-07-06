const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Autenticación requerida' });
    }

    if (!allowedRoles.includes(req.user.rol)) {
      return res.status(403).json({ error: 'No tiene permisos para realizar esta acción' });
    }

    next();
  };
};

module.exports = roleMiddleware;
