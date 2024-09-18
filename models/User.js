const mongoose = require('mongoose');

const { Schema } = mongoose;

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  googleId: { type: String, required: false },
});
UserSchema.virtual('full_name').get(function fullName() {
  return `${this.firstName} ${this.lastName}`;
});
UserSchema.index(
  { googleId: 1 },
  {
    unique: true,
    partialFilterExpression: { googleId: { $exists: true, $ne: null } },
  }
);
module.exports = mongoose.model('User', UserSchema);
