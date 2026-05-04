const jwt = require('jsonwebtoken');

exports.generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      roleId: user.roleId
    },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};