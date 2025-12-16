package com.ttsoft.uflow.common;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.util.Log;

import com.ttsoft.uflow.dao.Database;

public class MySQLiteOpenHelper extends SQLiteOpenHelper {
    private static final String DB_NAME = "Test_20250206.db";
    private static final int vs = 1;
    private SQLiteDatabase database;

    // init table DatabaseList
    public static final String TB_NAME = "DATABASE_LIST";

    // init columns name in table
    public static final String CL_ORD = "_id";
    public static final String CL_SERVER_ADD = "SERVER_ADD_DBL";
    public static final String CL_API_NAME = "API_NAME_DBL";
    public static final String CL_DB_NAME = "DB_NAME_DBL";
    public static final String CL_DB_ALIAS = "DB_ALIAS_DBL";
    public static final String CL_DB_ADD = "DB_ADD_DBL";
    public static final String CL_DB_USER = "DB_USER_DBL";
    public static final String CL_DB_PASS = "DB_PASS_DBL";
    public static final String CL_VISIBLE = "IS_VISIBLE";

// ....

    public MySQLiteOpenHelper(Context context) {
        super(context, DB_NAME, null, vs);
        database = this.getWritableDatabase();
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        // TODO Auto-generated method stub

        String sqlCreateTable = "CREATE TABLE " + TB_NAME + "(" + CL_ORD
                + " INTEGER PRIMARY KEY, " + CL_DB_NAME + " TEXT, " + CL_DB_ALIAS + " TEXT, "
                + CL_SERVER_ADD + " TEXT, " + CL_API_NAME + " TEXT, " + CL_DB_ADD + " TEXT, " + CL_DB_USER + " TEXT, "
                + CL_DB_PASS + " TEXT, " + CL_VISIBLE + " INTEGER)";
        Log.d("debug", sqlCreateTable);
        db.execSQL(sqlCreateTable);

        // create more table if need
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        // TODO Auto-generated method stub
        db.execSQL("DROP TABLE IF EXISTS " + TB_NAME);
        onCreate(db);
    }

    // Methods
    // insert to table
    public void INSERT_Database(Database mDB) {
        ContentValues values = new ContentValues();
        values.put(CL_DB_NAME, mDB.getDbName());
        values.put(CL_DB_ALIAS, mDB.getDbAlias());
        values.put(CL_DB_ADD, mDB.getDbIP());
        values.put(CL_DB_USER, mDB.getDbUsername());
        values.put(CL_DB_PASS, mDB.getDbPassword());
        values.put(CL_SERVER_ADD, mDB.getServerIP());
        values.put(CL_API_NAME, mDB.getApiName());
        values.put(CL_VISIBLE, mDB.getIsVisible());
        database.insertOrThrow(TB_NAME, null, values);
    }

    // delete 1 record in table
    public void DELETE_Database(int id) {
        database.delete(TB_NAME, CL_ORD + " = " + id, null);
    }

    // update 1 record in table
    public void UPDATE_Database(Database mDB, int id) {
        ContentValues values = new ContentValues();
        values.put(CL_SERVER_ADD, mDB.getServerIP());
        values.put(CL_API_NAME, mDB.getApiName());
        values.put(CL_DB_ADD, mDB.getDbIP());
        values.put(CL_DB_NAME, mDB.getDbName());
        values.put(CL_DB_ALIAS, mDB.getDbAlias());
        values.put(CL_DB_USER, mDB.getDbUsername());
        values.put(CL_DB_PASS, mDB.getDbPassword());
        values.put(CL_VISIBLE, mDB.getIsVisible());

        database.update(TB_NAME, values, "_id = " + id, null);
    }

    // update visible status of 1 DB in table
    public void UPDATE_Visible(Database mDB, int id) {
        ContentValues values = new ContentValues();
        values.put(CL_VISIBLE, mDB.getIsVisible());

        database.update(TB_NAME, values, "_id = " + id, null);
    }

    // select all records
    public Cursor SELECT_ALL_DB() {
        return database.query(TB_NAME, new String[]{CL_ORD, CL_DB_NAME, CL_DB_ALIAS, CL_SERVER_ADD, CL_API_NAME,
                CL_DB_ADD, CL_DB_USER, CL_DB_PASS, CL_VISIBLE}, null, null, null, null, null);
    }

    public void DELETE_ALL() {
        database.delete(TB_NAME, null, null);
    }

    public Cursor SELECTSQL(String sql) {
        return database.rawQuery(sql, null);
    }

    // close database
    public void CloseDB() {
        if (database != null && database.isOpen())
            database.close();
    }
}
