import mongoose from 'mongoose'; // 1. Use import
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  roleId: { type: String, default: "r3" }
});

const User = mongoose.model('User', userSchema);

export default User; // 2. Use export default