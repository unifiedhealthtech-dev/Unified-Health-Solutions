import sequelize from '../db.js'; // Make sure path is correct!
import { DataTypes } from 'sequelize';

const User = sequelize.define('User', { // Singular name recommended
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  hashedpassword: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
 // maps to existing table
    timestamps: true   // no createdAt/updatedAt
});
const model = await User.sync(); // Sync model with DB
console.log("User model synced:", model === User); // true if successful
export default User;