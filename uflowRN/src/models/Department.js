/**
 * Department model
 * Represents a factory department/workshop
 * Equivalent to Department.java in Android
 */
export class Department {
  constructor(NO_DEP = '', NAME_DEP = '') {
    this.NO_DEP = NO_DEP; // Department code (e.g., "TD.SM")
    this.NAME_DEP = NAME_DEP; // Department name (e.g., "XƯỞNG SƠ MI")
  }

  /**
   * Create Department instance from plain object
   * @param {Object} data - Plain object with NO_DEP and NAME_DEP fields
   * @returns {Department} Department instance
   */
  static fromObject(data) {
    return new Department(data.NO_DEP, data.NAME_DEP);
  }

  /**
   * Convert to plain object
   * @returns {Object} Plain object representation
   */
  toObject() {
    return {
      NO_DEP: this.NO_DEP,
      NAME_DEP: this.NAME_DEP,
    };
  }
}
