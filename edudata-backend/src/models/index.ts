// edudata-backend/src/models/index.ts
/**
 * Safe TypeScript wrapper around the runtime JS models/index.js
 *
 * This file does NOT create or re-declare sequelize/models. It only requires
 * the existing runtime JS module and re-exports objects under typed names.
 *
 * Purpose: satisfy TypeScript imports from other TS files like:
 *   import { User, StudentProfile, Institution, Teacher, Scheme, Placement, OtpSession, sequelize } from '../models';
 *
 * The wrapper defers to whatever the runtime JS file exports (commonjs / default).
 */

type AnyObj = any;

// Load the compiled JS models module at runtime.
// Try both './index.js' and '.' to be resilient to how node resolves it.
const raw: AnyObj = (() => {
  try {
    return require('./index.js');
  } catch (e1) {
    try {
      return require('.');
    } catch (e2) {
      // fallback to empty object to avoid crashes while editing
      return {};
    }
  }
})();

// Pick the most likely exports from the raw module
const User: AnyObj =
  raw.User ||
  raw.user ||
  raw.default?.User ||
  raw.default?.user ||
  raw.models?.User ||
  raw.models?.user ||
  undefined;

const StudentProfile: AnyObj =
  raw.StudentProfile ||
  raw.studentProfile ||
  raw.Student ||
  raw.student ||
  raw.default?.StudentProfile ||
  raw.default?.studentProfile ||
  raw.models?.StudentProfile ||
  raw.models?.studentProfile ||
  undefined;

const Institution: AnyObj =
  raw.Institution ||
  raw.institution ||
  raw.default?.Institution ||
  raw.default?.institution ||
  raw.models?.Institution ||
  raw.models?.institution ||
  undefined;

const Department: AnyObj =
  raw.Department ||
  raw.department ||
  raw.default?.Department ||
  raw.default?.department ||
  raw.models?.Department ||
  raw.models?.department ||
  undefined;

const Teacher: AnyObj =
  raw.Teacher ||
  raw.teacher ||
  raw.default?.Teacher ||
  raw.default?.teacher ||
  raw.models?.Teacher ||
  raw.models?.teacher ||
  undefined;

const Scheme: AnyObj =
  raw.Scheme ||
  raw.scheme ||
  raw.default?.Scheme ||
  raw.default?.scheme ||
  raw.models?.Scheme ||
  raw.models?.scheme ||
  undefined;

const Placement: AnyObj =
  raw.Placement ||
  raw.placement ||
  raw.default?.Placement ||
  raw.default?.placement ||
  raw.models?.Placement ||
  raw.models?.placement ||
  undefined;

const OtpSession: AnyObj =
  raw.OtpSession ||
  raw.otpSession ||
  raw.default?.OtpSession ||
  raw.default?.otpSession ||
  raw.models?.OtpSession ||
  raw.models?.otpSession ||
  undefined;

const sequelize: AnyObj =
  raw.sequelize ||
  raw.default?.sequelize ||
  raw.db ||
  raw.default?.db ||
  undefined;

// Export them for TypeScript code to import (typed as any)
export {
  User,
  StudentProfile,
  Institution,
  Department,
  Teacher,
  Scheme,
  Placement,
  OtpSession,
  sequelize,
};

// Also default export for compatibility
export default {
  User,
  StudentProfile,
  Institution,
  Department,
  Teacher,
  Scheme,
  Placement,
  OtpSession,
  sequelize,
};
