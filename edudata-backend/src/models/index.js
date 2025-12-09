// models/index.js
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// Single Sequelize instance for the whole backend
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    port: process.env.DB_PORT || 3306,
    logging: false,
  }
);

// Core auth/user model
const User = require('./user')(sequelize);

// Student profile (per-user academic data)
const StudentProfile = require('./studentProfile')(sequelize);

// Institution and department domain models
const Institution = sequelize.define(
  'Institution',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    aishe_code: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    location: { type: DataTypes.STRING(255) },
    type: { type: DataTypes.STRING(50) },
    nirf_rank: { type: DataTypes.INTEGER },
    established_year: { type: DataTypes.INTEGER },
    students_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    teachers_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    performance_score: { type: DataTypes.DECIMAL(5, 2) },
    compliance_score: { type: DataTypes.DECIMAL(5, 2) },
    graduation_rate: { type: DataTypes.DECIMAL(5, 2) },
    placement_rate: { type: DataTypes.DECIMAL(5, 2) },
  },
  {
    tableName: 'institutions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

const Department = sequelize.define(
  'Department',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    institution_id: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING(255), allowNull: false },
    students_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    teachers_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  {
    tableName: 'departments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

// Teacher domain model
const Teacher = sequelize.define(
  'Teacher',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    institution_id: { type: DataTypes.INTEGER, allowNull: false },
    department_id: { type: DataTypes.INTEGER, allowNull: true },
    apar_id: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    designation: { type: DataTypes.STRING(100) },
    experience_years: { type: DataTypes.INTEGER, defaultValue: 0 },
    research_projects: { type: DataTypes.INTEGER, defaultValue: 0 },
    publications: { type: DataTypes.INTEGER, defaultValue: 0 },
    training_programs: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  {
    tableName: 'teachers',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

// Government scheme model
const Scheme = sequelize.define(
  'Scheme',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    type: { type: DataTypes.STRING(100) },
    budget: { type: DataTypes.BIGINT },
    beneficiaries: { type: DataTypes.INTEGER },
    eligibility_criteria: { type: DataTypes.TEXT },
    status: { type: DataTypes.STRING(50) },
    launch_date: { type: DataTypes.DATEONLY },
    extra: { type: DataTypes.JSON, allowNull: true },
  },
  {
    tableName: 'schemes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

// Placement model (student outcomes)
const Placement = sequelize.define(
  'Placement',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    student_user_id: { type: DataTypes.INTEGER, allowNull: false },
    institution_id: { type: DataTypes.INTEGER, allowNull: false },
    department_name: { type: DataTypes.STRING(255) },
    company: { type: DataTypes.STRING(255) },
    package_lpa: { type: DataTypes.DECIMAL(6, 2) },
    date: { type: DataTypes.DATEONLY },
  },
  {
    tableName: 'placements',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

// OTP session model (for OTP-based login)
const OtpSession = sequelize.define(
  'OtpSession',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    token: { type: DataTypes.STRING(64), allowNull: false, unique: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    contact: { type: DataTypes.STRING(255), allowNull: false },
    code_hash: { type: DataTypes.STRING(255), allowNull: false },
    expires_at: { type: DataTypes.DATE, allowNull: false },
    used: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    tableName: 'otp_sessions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

// Associations
User.hasOne(StudentProfile, { foreignKey: 'user_id', as: 'profile' });
StudentProfile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Institution.hasMany(Department, { foreignKey: 'institution_id', as: 'departments' });
Department.belongsTo(Institution, { foreignKey: 'institution_id', as: 'institution' });

Institution.hasMany(StudentProfile, { foreignKey: 'institution_id', as: 'students' });
// Use a non-colliding alias so we don't clash with the 'institution' string field on StudentProfile
StudentProfile.belongsTo(Institution, { foreignKey: 'institution_id', as: 'institutionRecord' });

Institution.hasMany(Teacher, { foreignKey: 'institution_id', as: 'teachers' });
Teacher.belongsTo(Institution, { foreignKey: 'institution_id', as: 'institution' });

Department.hasMany(Teacher, { foreignKey: 'department_id', as: 'teachers' });
Teacher.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });

User.hasOne(Teacher, { foreignKey: 'user_id', as: 'teacherProfile' });
Teacher.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Placement, { foreignKey: 'student_user_id', as: 'placements' });
Placement.belongsTo(User, { foreignKey: 'student_user_id', as: 'studentUser' });

Institution.hasMany(Placement, { foreignKey: 'institution_id', as: 'institutionPlacements' });
Placement.belongsTo(Institution, { foreignKey: 'institution_id', as: 'institution' });

User.hasMany(OtpSession, { foreignKey: 'user_id', as: 'otpSessions' });
OtpSession.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  sequelize,
  User,
  StudentProfile,
  Institution,
  Department,
  Teacher,
  Scheme,
  Placement,
  OtpSession,
};
