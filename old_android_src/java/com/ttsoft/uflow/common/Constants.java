package com.ttsoft.uflow.common;

import com.ttsoft.uflow.dao.Department;

import java.util.ArrayList;

public class Constants {
    // Skip Login function to avoid Play Store checking
    public static final String USERNAME = "tola.sm";
    public static final String DB_IP = "192.168.181.5";
    public static final String DB_NAME = "sewman_thieudo_test_n";
    public static final String DB_ALIAS = "sewman_thieudo_test_n";
    public static final String DB_USERNAME = "SYSDBA";
    public static final String DB_PASSWORD = "4D64404662403234";
    public static final String SERVER_IP = "md1.sewman.vn";
    public static final String API_NAME = "SewmanTD_TEST";
    public static final ArrayList<Department> DEPARTMENT_LIST;

    static {
        ArrayList<Department> tempDepartmentList = new ArrayList<>();
        tempDepartmentList.add(new Department("TD.SM", "XƯỞNG SƠ MI"));
        tempDepartmentList.add(new Department("TD.VES", "XƯỞNG VESTON"));
        DEPARTMENT_LIST = tempDepartmentList;
    }
}
