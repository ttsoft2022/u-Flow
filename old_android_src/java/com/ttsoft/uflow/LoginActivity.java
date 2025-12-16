package com.ttsoft.uflow;

import android.animation.Animator;
import android.animation.AnimatorListenerAdapter;
import android.app.AlertDialog;
import android.app.ProgressDialog;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.database.Cursor;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.os.AsyncTask;
import android.os.Bundle;
import android.text.TextUtils;
import android.util.Log;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.loopj.android.http.AsyncHttpClient;
import com.loopj.android.http.AsyncHttpResponseHandler;
import com.loopj.android.http.RequestParams;
import com.ttsoft.uflow.common.Constants;
import com.ttsoft.uflow.common.MyApplication;
import com.ttsoft.uflow.common.MySQLiteOpenHelper;
import com.ttsoft.uflow.common.Utility;
import com.ttsoft.uflow.dao.Database;
import com.ttsoft.uflow.dao.Department;
import com.ttsoft.uflow.databinding.ActivityLoginBinding;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

import cz.msebera.android.httpclient.Header;

public class LoginActivity extends AppCompatActivity {
    private static final String TAG = "Login Activity";

    private static UserLoginTask mAuthTask = null;

    // UI references.
    private ProgressDialog prgDialog;
    private EditText mUsernameView;
    private EditText mPasswordView;
    private View mProgressView;
    private View mLoginFormView;
    private CheckBox cbRem;
    private Spinner spDB;

    private int dbID = 0;
    private String mDbIP = "";
    private String mDbName = "";
    private String mDbAlias = "";
    private String mDbUsername = "";
    private String mDbPassword = "";
    private String mServerIP = "";
    private String mApiName = "";

    private String strDB = "";
    private Integer isLogin;
    private ArrayList<Department> list_nodep = new ArrayList<>();

    private MyApplication mApp;
    private MySQLiteOpenHelper dataHelper;
    private Cursor cursor;
    private SharedPreferences.Editor loginPrefsEditor;

    private static AsyncHttpClient client = new AsyncHttpClient();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_login);
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.layoutLogin), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });

        mApp = ((MyApplication) getApplicationContext());
        dataHelper = new MySQLiteOpenHelper(LoginActivity.this);

        com.ttsoft.uflow.databinding.ActivityLoginBinding binding = ActivityLoginBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        Intent intent = this.getIntent();
        isLogin = intent.getIntExtra("IS_LOGIN", 0);

        // Instantiate Progress Dialog object
        prgDialog = new ProgressDialog(this);
        // Set Progress Dialog Text
        prgDialog.setMessage("Please wait...");
        // Set Cancelable as False
        prgDialog.setCancelable(false);

        mUsernameView = findViewById(R.id.username);
        mPasswordView = findViewById(R.id.password);

        Button btnLogin = findViewById(R.id.btnLogin);
        if (btnLogin != null) {
            btnLogin.setOnClickListener(view -> attemptLogin());
        }

        mLoginFormView = findViewById(R.id.login_form);
        mProgressView = findViewById(R.id.login_progress);
        mProgressView.setVisibility(View.GONE);

        spDB = findViewById(R.id.spDatabase);
        cbRem = findViewById(R.id.ckRem);
    }

    protected void onResume() {
        super.onResume();

        // Check to see if DATABASE_LIST table has data or not
        String sql = "SELECT EXISTS (SELECT 1 from " + MySQLiteOpenHelper.TB_NAME + ")";
        cursor = dataHelper.SELECTSQL(sql);
        if (cursor != null) {
            cursor.moveToFirst();                       // Always one row returned.
            if (cursor.getInt(0) == 0) {                // Zero count means empty table.
                // add data
                loadData();
            }
        }

        // Get all records from DATABASE_LIST table
        cursor = dataHelper.SELECT_ALL_DB();
        cursor.moveToFirst();
        dbID = Integer.parseInt(cursor.getString(cursor.getColumnIndexOrThrow(MySQLiteOpenHelper.CL_ORD)));
        mDbName = cursor.getString(cursor.getColumnIndexOrThrow(MySQLiteOpenHelper.CL_DB_NAME));
        mDbAlias = cursor.getString(cursor.getColumnIndexOrThrow(MySQLiteOpenHelper.CL_DB_ALIAS));
        mDbIP = cursor.getString(cursor.getColumnIndexOrThrow(MySQLiteOpenHelper.CL_DB_ADD));
        mDbUsername = cursor.getString(cursor.getColumnIndexOrThrow(MySQLiteOpenHelper.CL_DB_USER));
        mServerIP = cursor.getString(cursor.getColumnIndexOrThrow(MySQLiteOpenHelper.CL_SERVER_ADD));
        mApiName = cursor.getString(cursor.getColumnIndexOrThrow(MySQLiteOpenHelper.CL_API_NAME));

        /* Add DB name from database to spinner */
        List<String> dbList = new ArrayList<>();
        String sqlList = "select " + MySQLiteOpenHelper.CL_DB_ALIAS + " from " + MySQLiteOpenHelper.TB_NAME
                + " where " + MySQLiteOpenHelper.CL_VISIBLE + " = 1";
        Log.d(TAG, sqlList);
        Cursor cursorList = dataHelper.SELECTSQL(sqlList);
        while (cursorList.moveToNext()) {
            dbList.add(cursorList.getString(cursorList
                    .getColumnIndexOrThrow(MySQLiteOpenHelper.CL_DB_ALIAS)));
        }
        ArrayAdapter<String> dataAdapter = new ArrayAdapter<>(this,
                R.layout.layout_spinner_login, dbList);
        dataAdapter.setDropDownViewResource(R.layout.layout_spinner_login);
        spDB.setAdapter(dataAdapter);
        spDB.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                strDB = parent.getItemAtPosition(position).toString().trim();
                String sql = "select * from " + MySQLiteOpenHelper.TB_NAME + " where "
                        + MySQLiteOpenHelper.CL_DB_ALIAS + " = '" + strDB + "'";
                Log.d(TAG, sql);
                cursor = dataHelper.SELECTSQL(sql);
                cursor.moveToNext();

                dbID = Integer.parseInt(cursor.getString(cursor
                        .getColumnIndexOrThrow(MySQLiteOpenHelper.CL_ORD)));
                mDbName = cursor.getString(cursor
                        .getColumnIndexOrThrow(MySQLiteOpenHelper.CL_DB_NAME));
                mDbAlias = cursor.getString(cursor
                        .getColumnIndexOrThrow(MySQLiteOpenHelper.CL_DB_ALIAS));
                mDbIP = cursor.getString(cursor
                        .getColumnIndexOrThrow(MySQLiteOpenHelper.CL_DB_ADD));
                mDbUsername = cursor.getString(cursor
                        .getColumnIndexOrThrow(MySQLiteOpenHelper.CL_DB_USER));
                mDbPassword = cursor.getString(cursor
                        .getColumnIndexOrThrow(MySQLiteOpenHelper.CL_DB_PASS));
                mServerIP = cursor.getString(cursor
                        .getColumnIndexOrThrow(MySQLiteOpenHelper.CL_SERVER_ADD));
                mApiName = cursor.getString(cursor
                        .getColumnIndexOrThrow(MySQLiteOpenHelper.CL_API_NAME));
            }

            @Override
            public void onNothingSelected(AdapterView<?> parent) {

            }
        });

        // Remember check Box
        SharedPreferences loginPreferences = getSharedPreferences("loginPrefs", MODE_PRIVATE);
        loginPrefsEditor = loginPreferences.edit();
        Boolean saveLogin = loginPreferences.getBoolean("saveLogin", false);
        if (saveLogin) {
            mUsernameView.setText(loginPreferences.getString("username", ""));
            mPasswordView.setText(loginPreferences.getString("password", ""));
            spDB.setSelection(dataAdapter.getPosition(loginPreferences.getString("database", "")));
            cbRem.setChecked(true);

            if (isLogin == null) {
                isLogin = 0;
            }

            if (isLogin == 0) {
                String username = mUsernameView.getText().toString();
                String selectedDB = spDB.getSelectedItem().toString().trim();
                String sqlDB = "select * from " + MySQLiteOpenHelper.TB_NAME + " where "
                        + MySQLiteOpenHelper.CL_DB_ALIAS + " = '" + selectedDB + "'";
                Log.d(TAG, sqlDB);
                cursor = dataHelper.SELECTSQL(sqlDB);
                cursor.moveToNext();

                dbID = Integer.parseInt(cursor.getString(cursor
                        .getColumnIndexOrThrow(MySQLiteOpenHelper.CL_ORD)));
                mDbIP = cursor.getString(cursor
                        .getColumnIndexOrThrow(MySQLiteOpenHelper.CL_DB_ADD));
                mDbName = cursor.getString(cursor
                        .getColumnIndexOrThrow(MySQLiteOpenHelper.CL_DB_NAME));
                mDbAlias = cursor.getString(cursor
                        .getColumnIndexOrThrow(MySQLiteOpenHelper.CL_DB_ALIAS));
                mDbUsername = cursor.getString(cursor
                        .getColumnIndexOrThrow(MySQLiteOpenHelper.CL_DB_USER));
                mDbPassword = cursor.getString(cursor
                        .getColumnIndexOrThrow(MySQLiteOpenHelper.CL_DB_PASS));
                mServerIP = cursor.getString(cursor
                        .getColumnIndexOrThrow(MySQLiteOpenHelper.CL_SERVER_ADD));
                mApiName = cursor.getString(cursor
                        .getColumnIndexOrThrow(MySQLiteOpenHelper.CL_API_NAME));

                MyApplication mApp = ((MyApplication) getApplicationContext());
                mApp.setUserNo(username);
                mApp.setDbName(mDbName);
                mApp.setDbAlias(mDbAlias);
                mApp.setDbIP(mDbIP);
                mApp.setDbUsername(mDbUsername);
                mApp.setDbPassword(mDbPassword);
                mApp.setServerIP(mServerIP);
                mApp.setApiName(mApiName);

                attemptLogin();
            } else {
                loginPrefsEditor.putBoolean("saveLogin", false);
                loginPrefsEditor.apply();
            }
        }
    }

    protected void onPause() {
        super.onPause();
        prgDialog.dismiss();
    }

    private void attemptLogin() {
        if (mAuthTask != null) {
            return;
        }

        // Reset errors.
        mUsernameView.setError(null);
        mPasswordView.setError(null);

        // Store values at the time of the login attempt.
        String username = mUsernameView.getText().toString();
        String password = mPasswordView.getText().toString();

        boolean cancel = false;
        View focusView = null;

        // Check for a valid email address.
        if (TextUtils.isEmpty(username)) {
            mUsernameView.setError(getString(R.string.error_field_required));
            focusView = mUsernameView;
            cancel = true;
        }

        if (cancel) {
            // There was an error; don't attempt login and focus the first
            // form field with an error.
            focusView.requestFocus();
        } else {
            // Show a progress spinner, and kick off a background task to
            // perform the user login attempt.

            // if username = myapp -> use constants param for testing
            if (username.equals("myapp")) {
                mApp.setUserNo(Constants.USERNAME);
                mApp.setDbIP(Constants.DB_IP);
                mApp.setDbName(Constants.DB_NAME);
                mApp.setDbAlias(Constants.DB_ALIAS);
                mApp.setDbUsername(Constants.DB_USERNAME);
                mApp.setDbPassword(Constants.DB_PASSWORD);
                mApp.setServerIP(Constants.SERVER_IP);
                mApp.setApiName(Constants.API_NAME);
                mApp.setListDep(Constants.DEPARTMENT_LIST);

                // Navigate to Main screen
                Intent intent = new Intent(getApplicationContext(), MainActivity.class);
                startActivity(intent);
            } else {
                showProgress(true);
                mAuthTask = new UserLoginTask(username, password);
                mAuthTask.execute((Void) null);
            }

        }
    }

    /**
     * Shows the progress UI and hides the login form.
     */
    private void showProgress(final boolean show) {
        // On Honeycomb MR2 we have the ViewPropertyAnimator APIs, which allow
        // for very easy animations. If available, use these APIs to fade-in
        // the progress spinner.
        int shortAnimTime = getResources().getInteger(android.R.integer.config_shortAnimTime);

        mLoginFormView.setVisibility(show ? View.GONE : View.VISIBLE);
        mLoginFormView.animate().setDuration(shortAnimTime).alpha(
                show ? 0 : 1).setListener(new AnimatorListenerAdapter() {
            @Override
            public void onAnimationEnd(Animator animation) {
                mLoginFormView.setVisibility(show ? View.GONE : View.VISIBLE);
            }
        });

        mProgressView.setVisibility(show ? View.VISIBLE : View.GONE);
        mProgressView.animate().setDuration(shortAnimTime).alpha(
                show ? 1 : 0).setListener(new AnimatorListenerAdapter() {
            @Override
            public void onAnimationEnd(Animator animation) {
                mProgressView.setVisibility(show ? View.VISIBLE : View.GONE);
            }
        });
    }

    /**
     * Represents an asynchronous login/registration task used to authenticate
     * the user.
     */
    public class UserLoginTask extends AsyncTask<Void, Void, Boolean> {

        private final String mUsername;
        private final String mPassword;

        UserLoginTask(String username, String password) {
            mUsername = username;
            mPassword = password;

            // remember login info
            if (cbRem.isChecked()) {
                loginPrefsEditor.putBoolean("saveLogin", true);
                loginPrefsEditor.putString("username", mUsername);
                loginPrefsEditor.putString("password", mPassword);
                loginPrefsEditor.putString("database", mDbName);
                loginPrefsEditor.putInt("database_id", dbID);
                loginPrefsEditor.commit();
            }
        }

        @Override
        protected Boolean doInBackground(Void... params) {
            try {
                if (!isNetworkConnected()) {
                    AlertDialog.Builder builder = new AlertDialog.Builder(LoginActivity.this);
                    builder.setTitle(getString(R.string.dialog_header_warning));
                    builder.setMessage(getString(R.string.error_));
                    builder.setCancelable(false);
                    builder.setPositiveButton("OK", (dialog, which) -> dialog.dismiss());
                    AlertDialog dialog = builder.create();
                    dialog.show();
                } else {
                    mApp.setUserNo(mUsername);
                    mApp.setDbIP(mDbIP);
                    mApp.setDbName(mDbName);
                    mApp.setDbAlias(mDbAlias);
                    mApp.setDbUsername(mDbUsername);
                    mApp.setDbPassword(mDbPassword);
                    mApp.setServerIP(mServerIP);
                    mApp.setApiName(mApiName);
                }
            } catch (Exception e) {
                e.printStackTrace();
                return false;
            }
            return true;
        }

        @Override
        protected void onPostExecute(final Boolean success) {
            mAuthTask = null;

            if (success) {
                // call Login method
                RequestParams params = new RequestParams();
                params.put("name_usl", mUsername);
                params.put("password_usl", Utility.md5(mPassword));
                params.put("dbIP", mDbIP);
                params.put("dbName", mDbName);
                params.put("dbUsername", mDbUsername);
                params.put("dbPassword", mDbPassword);
                wsLogin(params);
            } else {
                mPasswordView.setError(getString(R.string.error_incorrect_password));
                mPasswordView.requestFocus();
            }
        }

        @Override
        protected void onCancelled() {
            mAuthTask = null;
            showProgress(false);
        }
    }

    public void wsLogin(RequestParams params) {
        // Make RESTful webservice call using AsyncHttpClient object
        client.setTimeout(10000);
        client.get("http://" + mServerIP + "/" + mApiName + "/general/login", params, new AsyncHttpResponseHandler() {
            @Override
            public void onSuccess(int statusCode, Header[] headers, byte[] responseBody) {
                String response = new String(responseBody);

                try {
                    // JSON Object
                    JSONObject obj = new JSONObject(response);
                    if (obj.getBoolean("status")) {
                        isLogin = 0;

                        // get list of factory department (type = 11)
                        getDepFactory(11);
                    } else {
                        showProgress(false);
                        Toast.makeText(getApplicationContext(), getString(R.string.error_login_failed), Toast.LENGTH_SHORT).show();
                    }
                } catch (JSONException e) {
                    Log.e(TAG, "wsLogin - onSuccess: ", e);
                }
            }

            @Override
            public void onFailure(int statusCode, Header[] headers, byte[] responseBody, Throwable error) {
                showProgress(false);
                // When Http response code is '404'
                if (statusCode == 404) {
                    Log.e(TAG, getString(R.string.error_404));
                }
                // When Http response code is '500'
                else if (statusCode == 500) {
                    Log.e(TAG, getString(R.string.error_500));
                }

                Toast.makeText(getApplicationContext(), getString(R.string.error_), Toast.LENGTH_SHORT).show();
            }
        });
    }

    public void getDepFactory(int aType) {
        RequestParams params = new RequestParams();
        params.put("type", String.valueOf(aType));
        params.put("dbIP", mDbIP);
        params.put("dbName", mDbName);
        params.put("dbUsername", mDbUsername);
        params.put("dbPassword", Utility.dbEncrypt(mDbPassword));
        wsGetDep(params);
    }

    public void wsGetDep(final RequestParams params) {
        if (!isFinishing()) {
            // Make RESTful webservice call using AsyncHttpClient object
            AsyncHttpClient client = new AsyncHttpClient();
            client.setTimeout(10000);
            client.get("http://" + mServerIP + "/" + Constants.API_NAME + "/general/stats/getdepfactory", params, new AsyncHttpResponseHandler() {
                @Override
                public void onSuccess(int statusCode, Header[] headers, byte[] responseBody) {
                    String response = new String(responseBody);

                    try {
                        // clear list
                        list_nodep.clear();

                        // JSON Object
                        JSONObject obj = new JSONObject(response);
                        JSONArray jArr = obj.getJSONArray("list");
                        int jCount = jArr.length();

                        for (int i = 0; i < jCount; i++) {
                            obj = jArr.getJSONObject(i);

                            Department s1 = new Department(obj.getString("NO_DEP"), obj.getString("NAME_DEP"));
                            if (!list_nodep.contains(s1)) {
                                list_nodep.add(s1);
                            }
                        }

                        mApp.setListDep(list_nodep);

                        // Navigate to Main screen
                        Intent generalIntent = new Intent(getApplicationContext(), MainActivity.class);
                        startActivity(generalIntent);

                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
                }

                @Override
                public void onFailure(int statusCode, Header[] headers, byte[] responseBody, Throwable error) {
                    // When Http response code is '404'
                    if (statusCode == 404) {
                        Log.e(TAG, getString(R.string.error_404));
                    }
                    // When Http response code is '500'
                    else if (statusCode == 500) {
                        Log.e(TAG, getString(R.string.error_500));
                    }

                    Toast.makeText(getApplicationContext(), getString(R.string.error_), Toast.LENGTH_SHORT).show();
                }
            });
        }
    }

    private boolean isNetworkConnected() {
        ConnectivityManager cm = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
        NetworkInfo ni = null;
        if (cm != null) {
            ni = cm.getActiveNetworkInfo();
        }
        return ni != null;
    }

    private void loadData() {
        // DB test
//        Database mDatabase1 = new Database("192.168.181.6:8081", "SewmanTD_TEST", "192.168.181.5", "sewman_thieudo_test", "sewman_thieudo_test", "SYSDBA", "Md@Fb@24", 1);
//        dataHelper.INSERT_Database(mDatabase1);
//
//        Database mDatabase2 = new Database("md1.sewman.vn:8081", "SewmanTD_TEST", "192.168.181.5", "sewman_thieudo_test_n", "sewman_thieudo_test_n", "SYSDBA", "Md@Fb@24", 1);
//        dataHelper.INSERT_Database(mDatabase2);

        // DB production
        Database mDatabase1 = new Database("192.168.181.6:8081", "SewmanTD", "192.168.181.5", "sewman_thieudo", "sewman_thieudo", "SYSDBA", "Md@Fb@24", 1);
        dataHelper.INSERT_Database(mDatabase1);

        Database mDatabase2 = new Database("md1.sewman.vn:8081", "SewmanTD", "192.168.181.5", "sewman_thieudo_n", "sewman_thieudo_n", "SYSDBA", "Md@Fb@24", 1);
        dataHelper.INSERT_Database(mDatabase2);

    }
}