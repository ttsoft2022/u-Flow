package com.ttsoft.uflow;

import android.content.Intent;
import android.os.Bundle;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.appcompat.app.ActionBar;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.core.view.GravityCompat;
import androidx.drawerlayout.widget.DrawerLayout;
import androidx.navigation.NavController;
import androidx.navigation.Navigation;
import androidx.navigation.ui.AppBarConfiguration;
import androidx.navigation.ui.NavigationUI;
import androidx.viewpager2.widget.ViewPager2;

import com.google.android.material.navigation.NavigationView;
import com.google.android.material.tabs.TabLayout;
import com.google.android.material.tabs.TabLayoutMediator;
import com.ttsoft.uflow.adapter.BottomPagerAdapter;
import com.ttsoft.uflow.adapter.TopPagerAdapter;
import com.ttsoft.uflow.common.Constants;
import com.ttsoft.uflow.common.MyApplication;
import com.ttsoft.uflow.dao.Department;
import com.ttsoft.uflow.databinding.ActivityMainBinding;

import java.util.ArrayList;

public class MainActivity extends AppCompatActivity implements NavigationView.OnNavigationItemSelectedListener {
    private static final String TAG = "Main Activity";

    private String mUsername = "";
    private String mDbName = "";
    private String mDbAlias = "";
    private String mDbIP = "";
    private String mDbUsername = "";
    private String mDbPassword = "";
    private String mServerIP = "";
    private String mApiName = "";

    private String mNoDep;
    private String mNameDep;
    private int mFactoryIndex = 0;
    private ArrayList<Department> mListDep = new ArrayList<>();

    private ViewPager2 mTopViewPager;
    private TopPagerAdapter mTopAdapter;
    private ViewPager2 mBottomViewPager;
    private BottomPagerAdapter mBottomAdapter;

    private MyApplication mApp;
    private androidx.appcompat.app.ActionBarDrawerToggle mDrawerToggle;

    private AppBarConfiguration mAppBarConfiguration;
    private ActivityMainBinding binding;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        binding = ActivityMainBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        Toolbar toolbar = binding.appBarMain.toolbar;
        setSupportActionBar(toolbar);

        DrawerLayout drawer = binding.drawerLayout;
        mDrawerToggle = new androidx.appcompat.app.ActionBarDrawerToggle(
                this, drawer, toolbar, R.string.navigation_drawer_open, R.string.navigation_drawer_close);
        drawer.addDrawerListener(mDrawerToggle);
        mDrawerToggle.syncState();

        NavigationView navigationView = binding.navView;
        // Passing each menu ID as a set of Ids because each
        // menu should be considered as top level destinations.
        mAppBarConfiguration = new AppBarConfiguration.Builder(
                R.id.nav_home, R.id.nav_gallery, R.id.nav_slideshow)
                .setOpenableLayout(drawer)
                .build();
        NavController navController = Navigation.findNavController(this, R.id.nav_host_fragment_content_main2);
        NavigationUI.setupActionBarWithNavController(this, navController, mAppBarConfiguration);
        NavigationUI.setupWithNavController(navigationView, navController);
        navigationView.setNavigationItemSelectedListener(this);

        mApp = ((MyApplication) getApplicationContext());
        mUsername = mApp.getUserNo();
        mDbIP = mApp.getDbIP();
        mDbName = mApp.getDbName();
        mDbAlias = mApp.getDbAlias();
        mDbUsername = mApp.getDbUsername();
        mDbPassword = mApp.getDbPassword();
        mServerIP = mApp.getServerIP();
        mApiName = mApp.getApiName();
        mListDep = mApp.getListDep();
        mFactoryIndex = 0;

        if (mUsername == null) {
            mUsername = Constants.USERNAME;
            mDbIP = Constants.DB_IP;
            mDbName = Constants.DB_NAME;
            mDbAlias = Constants.DB_ALIAS;
            mDbUsername = Constants.DB_USERNAME;
            mDbPassword = Constants.DB_PASSWORD;
            mServerIP = Constants.SERVER_IP;
            mApiName = Constants.API_NAME;
            mListDep = Constants.DEPARTMENT_LIST;

            mApp.setUserNo(mUsername);
            mApp.setDbIP(mDbIP);
            mApp.setDbName(mDbName);
            mApp.setDbAlias(mDbAlias);
            mApp.setDbUsername(mDbUsername);
            mApp.setDbPassword(mDbPassword);
            mApp.setServerIP(mServerIP);
            mApp.setApiName(mApiName);
            mApp.setListDep(mListDep);
        }

        mNoDep = mListDep.get(mFactoryIndex).getNO_DEP();
        mNameDep = mListDep.get(mFactoryIndex).getNAME_DEP();
        mApp.setNoDep(mNoDep);

        ActionBar actionBar = getSupportActionBar();
        if (actionBar != null) {
            actionBar.setDisplayHomeAsUpEnabled(true);
            actionBar.setHomeButtonEnabled(true);
            actionBar.setDisplayShowTitleEnabled(false);
            actionBar.setDisplayShowCustomEnabled(true);

            LayoutInflater inflater = LayoutInflater.from(this);
            View customView = inflater.inflate(R.layout.custom_action_bar_tab_layout, null);
            ActionBar.LayoutParams layoutParams = new ActionBar.LayoutParams(ActionBar.LayoutParams.MATCH_PARENT, ActionBar.LayoutParams.MATCH_PARENT, Gravity.CENTER);
            actionBar.setCustomView(customView, layoutParams);
        }

        TextView title = findViewById(R.id.action_bar_tab_title);
        title.setText(mNameDep.toUpperCase());

        View headerView = navigationView.getHeaderView(0);
        TextView headerText = headerView.findViewById(R.id.header_text);
        headerText.setText(mUsername);

        // Tab layout top
        mTopViewPager = findViewById(R.id.viewpagerTop);
        TabLayout topTabLayout = findViewById(R.id.tab_layout_top);
        mTopAdapter = new TopPagerAdapter(this);
        mTopViewPager.setAdapter(mTopAdapter);

        new TabLayoutMediator(topTabLayout, mTopViewPager, (tab, position) -> {
            switch (position) {
                case 0:
                    tab.setText(getString(R.string.top_tab_01_title));
                    break;
                case 1:
                    tab.setText(getString(R.string.top_tab_02_title));
                    break;
                case 2:
                    tab.setText(getString(R.string.top_tab_03_title));
                    break;
            }
        }).attach();

        // view Tab.3 first
        topTabLayout.selectTab(topTabLayout.getTabAt(2));
        mTopViewPager.setCurrentItem(2);

        // Tab layout bottom
        mBottomViewPager = findViewById(R.id.viewpagerBottom);
        TabLayout bottomTabLayout = findViewById(R.id.tab_layout_bottom);
        mBottomAdapter = new BottomPagerAdapter(this);
        mBottomViewPager.setAdapter(mBottomAdapter);

        new TabLayoutMediator(bottomTabLayout, mBottomViewPager, (tab, position) -> {
            switch (position) {
                case 0:
                    tab.setText(getString(R.string.bottom_tab_01_title));
                    break;
                case 1:
                    tab.setText(getString(R.string.bottom_tab_02_title));
                    break;
                case 2:
                    tab.setText(getString(R.string.bottom_tab_03_title));
                    break;
                case 3:
                    tab.setText(getString(R.string.bottom_tab_04_title));
                    break;
            }
        }).attach();
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_main, menu);
        return true;
    }

    @Override
    public boolean onSupportNavigateUp() {
        NavController navController = Navigation.findNavController(this, R.id.nav_host_fragment_content_main2);
        return NavigationUI.navigateUp(navController, mAppBarConfiguration)
                || super.onSupportNavigateUp();
    }

    @Override
    public boolean onNavigationItemSelected(@NonNull MenuItem item) {
        int id = item.getItemId();

        if (id == R.id.nav_user) {
            navigateToLogin();
        }

        DrawerLayout drawer = findViewById(R.id.drawer_layout);
        drawer.closeDrawer(GravityCompat.START);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // The action bar home/up action should open or close the drawer.
        // ActionBarDrawerToggle will take care of this.
        if (mDrawerToggle.onOptionsItemSelected(item)) {
            return true;
        }

        // Take appropriate action for each action item click
        if (item.getItemId() == R.id.action_switch_db) {
            switchDB();
            return true;
        }
        return super.onOptionsItemSelected(item);
    }

    public void switchDB() {
        if (mFactoryIndex < mListDep.size() - 1) {
            mFactoryIndex = mFactoryIndex + 1;
        } else {
            mFactoryIndex = 0;
        }

        ActionBar actionBar = getSupportActionBar();
        if (actionBar != null) {
            actionBar.setDisplayHomeAsUpEnabled(true);
            actionBar.setHomeButtonEnabled(true);
            actionBar.setDisplayShowTitleEnabled(false);
            actionBar.setDisplayShowCustomEnabled(true);

            LayoutInflater inflater = LayoutInflater.from(this);
            View customView = inflater.inflate(R.layout.custom_action_bar_tab_layout, null);
            actionBar.setCustomView(customView);
            ActionBar.LayoutParams layoutParams = new ActionBar.LayoutParams(ActionBar.LayoutParams.MATCH_PARENT, ActionBar.LayoutParams.MATCH_PARENT, Gravity.CENTER);
            actionBar.setCustomView(customView, layoutParams);
        }

        TextView title = findViewById(R.id.action_bar_tab_title);
        title.setText(mListDep.get(mFactoryIndex).getNAME_DEP().toUpperCase());

        mApp.setNoDep(mListDep.get(mFactoryIndex).getNO_DEP());

        // reset Viewpager
        mTopAdapter = new TopPagerAdapter(this);
        mTopViewPager.setAdapter(mTopAdapter);

        mBottomAdapter = new BottomPagerAdapter(this);
        mBottomViewPager.setAdapter(mBottomAdapter);
    }

    public void navigateToLogin() {
        Intent generalIntent = new Intent(getApplicationContext(), LoginActivity.class);
        generalIntent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
        generalIntent.putExtra("IS_LOGIN", 1);
        startActivity(generalIntent);
    }
}