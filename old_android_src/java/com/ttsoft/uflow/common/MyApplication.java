package com.ttsoft.uflow.common;

import android.app.Application;

import com.ttsoft.uflow.dao.Department;

import java.util.ArrayList;

public class MyApplication extends Application {
    private String userNo;
    private String noDep;
    private String dbName;
    private String dbAlias;
    private String dbUsername;
    private String dbPassword;
    private String dbIP;
    private String serverIP;
    private String apiName;
    private ArrayList<Department> listDep;

    public String getUserNo() {
        return userNo;
    }

    public void setUserNo(String userNo) {
        this.userNo = userNo;
    }

    public String getNoDep() {
        return noDep;
    }

    public void setNoDep(String noDep) {
        this.noDep = noDep;
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

    public String getDbIP() {
        return dbIP;
    }

    public void setDbIP(String dbIP) {
        this.dbIP = dbIP;
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

    public ArrayList<Department> getListDep() {
        return listDep;
    }

    public void setListDep(ArrayList<Department> listDep) {
        this.listDep = listDep;
    }
}
