const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  roleId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Role', roleSchema);
