// models/Party.js
import { DataTypes } from "sequelize";
import sequelize from "../db.js";
import Distributor from "./Distributor.js"; // import Distributor model

const Party = sequelize.define(
  "Party",
  {
    party_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dl_no: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gstin: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    contact_person: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mobile: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    area: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    district: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pincode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    credit_limit: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    type: {
      type: DataTypes.ENUM("Customer", "Supplier"),
      defaultValue: "Customer",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    distributor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "distributors", // must match Distributor table name
        key: "distributor_id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
  },
  {
    tableName: "parties",
    timestamps: true,
    underscored: true,
  }
);

// Associations
Party.belongsTo(Distributor, { foreignKey: "distributor_id" });
Distributor.hasMany(Party, { foreignKey: "distributor_id" });

export default Party;
