// models/studentProfile.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('StudentProfile', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    name: { type: DataTypes.STRING(255) },
    aadhaar_last4: { type: DataTypes.STRING(10) },
    year: { type: DataTypes.INTEGER },
    institution: { type: DataTypes.STRING(255) },
    cgpa: { type: DataTypes.DECIMAL(4,2) },
    attendance: { type: DataTypes.DECIMAL(5,2) },
    projects: { type: DataTypes.INTEGER, defaultValue: 0 },
    placement_status: { type: DataTypes.STRING(50), defaultValue: 'Not placed' },
    company: { type: DataTypes.STRING(255) },
    package_lpa: { type: DataTypes.DECIMAL(6,2) },
    other_fields: { type: DataTypes.JSON, allowNull: true }
  }, {
    tableName: 'student_profiles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
};
