package com.ttsoft.uflow.dao;

public class Department {
    String NO_DEP;
    String NAME_DEP;

    public Department(String NO_DEP, String NAME_DEP) {
        this.NO_DEP = NO_DEP;
        this.NAME_DEP = NAME_DEP;
    }

    public String getNO_DEP() {
        return NO_DEP;
    }

    public void setNO_DEP(String NO_DEP) {
        this.NO_DEP = NO_DEP;
    }

    public String getNAME_DEP() {
        return NAME_DEP;
    }

    public void setNAME_DEP(String NAME_DEP) {
        this.NAME_DEP = NAME_DEP;
    }
}
