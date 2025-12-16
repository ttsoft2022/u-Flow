package com.ttsoft.uflow.dao;

public class Database {
    public Integer ordinal;
    public String serverIP;
    public String apiName;
    public String dbIP;
    public String dbName;
    public String dbAlias;
    public String dbUsername;
    public String dbPassword;
    public Integer isVisible;

    public Database() {
    }

    public Database(Integer isVisible) {
        this.isVisible = isVisible;
    }

    public Database(String serverIP, String apiName, String dbIP, String dbName, String dbAlias, String dbUsername, String dbPassword, Integer isVisible) {
        this.serverIP = serverIP;
        this.apiName = apiName;
        this.dbIP = dbIP;
        this.dbName = dbName;
        this.dbAlias = dbAlias;
        this.dbUsername = dbUsername;
        this.dbPassword = dbPassword;
        this.isVisible = isVisible;
    }

    public Integer getOrdinal() {
        return ordinal;
    }

    public void setOrdinal(Integer ordinal) {
        this.ordinal = ordinal;
    }

    public String getServerIP() {
        return serverIP;
    }

    public void setServerIP(String serverIP) {
        this.serverIP = serverIP;
    }

    public String getApiName() {
        return apiName;
    }

    public void setApiName(String apiName) {
        this.apiName = apiName;
    }

    public String getDbIP() {
        return dbIP;
    }

    public void setDbIP(String dbIP) {
        this.dbIP = dbIP;
    }

    public String getDbName() {
        return dbName;
    }

    public void setDbName(String dbName) {
        this.dbName = dbName;
    }

    public String getDbAlias() {
        return dbAlias;
    }

    public void setDbAlias(String dbAlias) {
        this.dbAlias = dbAlias;
    }

    public String getDbUsername() {
        return dbUsername;
    }

    public void setDbUsername(String dbUsername) {
        this.dbUsername = dbUsername;
    }

    public String getDbPassword() {
        return dbPassword;
    }

    public void setDbPassword(String dbPassword) {
        this.dbPassword = dbPassword;
    }

    public Integer getIsVisible() {
        return isVisible;
    }

    public void setIsVisible(Integer isVisible) {
        this.isVisible = isVisible;
    }
}
