/**
 * Database model
 * Represents database configuration for connecting to remote Firebird databases
 * Equivalent to Database.java in Android
 */
export class Database {
  constructor({
    ordinal = null,
    serverIP = '',
    apiName = '',
    dbIP = '',
    dbName = '',
    dbAlias = '',
    dbUsername = '',
    dbPassword = '',
    isVisible = 1,
  } = {}) {
    this.ordinal = ordinal; // Record ID (_id in SQLite)
    this.serverIP = serverIP; // API Server IP (e.g., "md1.sewman.vn")
    this.apiName = apiName; // API endpoint name (e.g., "SewmanTD")
    this.dbIP = dbIP; // Database server IP
    this.dbName = dbName; // Database name
    this.dbAlias = dbAlias; // Database alias (display name)
    this.dbUsername = dbUsername; // DB username
    this.dbPassword = dbPassword; // DB password (encrypted)
    this.isVisible = isVisible; // Visibility flag (1=visible, 0=hidden)
  }

  /**
   * Create Database instance from plain object
   * @param {Object} data - Plain object with database fields
   * @returns {Database} Database instance
   */
  static fromObject(data) {
    return new Database(data);
  }

  /**
   * Convert to plain object
   * @returns {Object} Plain object representation
   */
  toObject() {
    return {
      ordinal: this.ordinal,
      serverIP: this.serverIP,
      apiName: this.apiName,
      dbIP: this.dbIP,
      dbName: this.dbName,
      dbAlias: this.dbAlias,
      dbUsername: this.dbUsername,
      dbPassword: this.dbPassword,
      isVisible: this.isVisible,
    };
  }
}
