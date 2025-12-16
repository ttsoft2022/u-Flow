package com.ttsoft.uflow;

import android.graphics.Color;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import android.widget.Toast;

import androidx.fragment.app.Fragment;

import com.github.mikephil.charting.charts.BarChart;
import com.github.mikephil.charting.components.XAxis;
import com.github.mikephil.charting.data.BarData;
import com.github.mikephil.charting.data.BarDataSet;
import com.github.mikephil.charting.data.BarEntry;
import com.github.mikephil.charting.formatter.IndexAxisValueFormatter;
import com.github.mikephil.charting.formatter.ValueFormatter;
import com.google.android.material.progressindicator.CircularProgressIndicator;
import com.loopj.android.http.AsyncHttpClient;
import com.loopj.android.http.AsyncHttpResponseHandler;
import com.loopj.android.http.RequestParams;
import com.ttsoft.uflow.common.CustomTopChartRenderer;
import com.ttsoft.uflow.common.MyApplication;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Locale;
import java.util.Objects;

import cz.msebera.android.httpclient.Header;

/**
 * A simple {@link Fragment} subclass.
 * Use the {@link TopFragment#newInstance} factory method to
 * create an instance of this fragment.
 */
public class TopFragment extends Fragment {
    private static final String TAG = "Fragment Top";

    public static String mUsername = "";
    public static String mNoDep = "";
    public static String mDBIP = "";
    public static String mDBName = "";
    public static String mDBUsername = "";
    public static String mDBPassword = "";
    public static String mServerIP = "";
    public static String mApiName = "";

    private TextView tvSum_01;
    private TextView tvSum_02;
    private TextView tvSum_Diff;

    private BarChart barChart;
    private View progressOverlay;
    private CircularProgressIndicator progressIndicator;

    // TODO: Rename parameter arguments, choose names that match
    // the fragment initialization parameters, e.g. ARG_ITEM_NUMBER
    private static final String ARG_PARAM1 = "type";

    // TODO: Rename and change types of parameters
    private int mType;

    public TopFragment() {
        // Required empty public constructor
    }

    /**
     * Use this factory method to create a new instance of
     * this fragment using the provided parameters.
     *
     * @param param1 Parameter 1.
     * @return A new instance of fragment TopFragment.
     */
    // TODO: Rename and change types and number of parameters
    public static TopFragment newInstance(int param1) {
        TopFragment fragment = new TopFragment();
        Bundle args = new Bundle();
        args.putInt(ARG_PARAM1, param1);
        fragment.setArguments(args);
        return fragment;
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (getArguments() != null) {
            mType = getArguments().getInt(ARG_PARAM1);
        }
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        // Inflate the layout for this fragment
        View view = inflater.inflate(R.layout.fragment_top, container, false);
        TextView tvHeader = view.findViewById(R.id.tv_fragment_top_title);
        TextView tvSub01 = view.findViewById(R.id.tv_fragment_top_sup_01_label);
        TextView tvSub02 = view.findViewById(R.id.tv_fragment_top_sub_02_label);

        tvSum_01 = view.findViewById(R.id.tv_fragment_top_sub_01);
        tvSum_02 = view.findViewById(R.id.tv_fragment_top_sub_02);
        tvSum_Diff = view.findViewById(R.id.tv_fragment_top_sub_02_02);

        tvSum_01.setText("");
        tvSum_02.setText("");
        tvSum_Diff.setText("");

        barChart = view.findViewById(R.id.barchart_top);
        progressOverlay = (View) view.findViewById(R.id.circularProgressIndicator).getParent();
        progressIndicator = view.findViewById(R.id.circularProgressIndicator);

        MyApplication mApp = ((MyApplication) requireActivity().getApplicationContext());
        mUsername = mApp.getUserNo();
        mNoDep = mApp.getNoDep();
        mDBIP = mApp.getDbIP();
        mDBName = mApp.getDbName();
        mDBUsername = mApp.getDbUsername();
        mDBPassword = mApp.getDbPassword();
        mServerIP = mApp.getServerIP();
        mApiName = mApp.getApiName();

        LocalDate currentDate = LocalDate.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        String strDate = currentDate.format(formatter);

        if (getArguments() != null) {
            if (mType == 1) {
                tvHeader.setText(getResources().getString(R.string.top_tab_01_header));
                tvSub01.setText(getResources().getString(R.string.top_tab_01_sub_header_01));
                tvSub02.setText(getResources().getString(R.string.top_tab_01_sub_header_02));
            } else if (mType == 2) {
                tvHeader.setText(getResources().getString(R.string.top_tab_02_header));
                tvSub01.setText(getResources().getString(R.string.top_tab_02_sub_header_01));
                tvSub02.setText(getResources().getString(R.string.top_tab_02_sub_header_02));
            } else {
                tvHeader.setText(getResources().getString(R.string.top_tab_03_header));
                tvSub01.setText(getResources().getString(R.string.top_tab_03_sub_header_01));
                tvSub02.setText(getResources().getString(R.string.top_tab_03_sub_header_02));
            }

            loadChart(mNoDep, strDate, strDate, mType);
        }
        return view;
    }

    public void loadChart(String aNoDep, String aFDate, String aTDate,
                          int aType) {
        // Tab 3 takes much time to load -> show progress bar
        if (mType == 3) {
            progressOverlay.setVisibility(View.VISIBLE);
            progressIndicator.setIndeterminate(true);
        }
        RequestParams params = new RequestParams();
        params.put("noDep", aNoDep);
        params.put("fdate", aFDate);
        params.put("tdate", aTDate);
        params.put("type", String.valueOf(aType));
        params.put("dbIP", mDBIP);
        params.put("dbName", mDBName);
        params.put("dbUsername", mDBUsername);
        params.put("dbPassword", mDBPassword);
        wsGetChart(params);
    }

    public void wsGetChart(final RequestParams params) {
        if (!getActivity().isFinishing()) {
            Log.d(TAG, "wsGetChart");

            AsyncHttpClient client = new AsyncHttpClient();
            client.setTimeout(30000);
            client.get("http://" + mServerIP + "/" + mApiName + "/general/flow/getflowcharttoday", params, new AsyncHttpResponseHandler() {
                @Override
                public void onSuccess(int statusCode, Header[] headers, byte[] responseBody) {
                    try {
                        // array list to store chart data
                        ArrayList<BarEntry> entries_01 = new ArrayList<>();
                        ArrayList<BarEntry> entries_02 = new ArrayList<>();
                        ArrayList<String> labels = new ArrayList<>();

                        // sum of qty
                        int sum_01 = 0;
                        int sum_02 = 0;
                        int sum_diff = 0;

                        // JSON Object
                        JSONObject obj = new JSONObject(new String(responseBody));
                        JSONArray jArr = obj.getJSONArray("list");
                        if (jArr.length() > 0) {
                            for (int i = 0; i < jArr.length(); i++) {
                                obj = jArr.getJSONObject(i);
                                int qty = (int) obj.getDouble("QTY");
                                int qty_02 = obj.getInt("QTY_WORKER");
                                int ordinal = obj.getInt("ORDINAL");
                                String label = obj.getString("LABEL");

                                entries_01.add(new BarEntry(ordinal, qty));
                                entries_02.add(new BarEntry(ordinal, qty_02));
                                labels.add(label);

                                sum_01 = sum_01 + qty;
                                sum_02 = sum_02 + qty_02;
                            }

                            NumberFormat numberFormat = NumberFormat.getNumberInstance(Locale.GERMAN);
                            tvSum_01.setText(numberFormat.format(sum_01));
                            tvSum_02.setText(numberFormat.format(sum_02));

                            if (mType == 2) {
                                sum_diff = sum_02 / sum_01 * 100;
                                tvSum_Diff.setText(String.format(Locale.GERMAN, "(%s%%)", numberFormat.format(sum_diff)));
                            } else {
                                sum_diff = sum_02 - sum_01;
                                if (sum_diff >= 0) {
                                    tvSum_Diff.setText(String.format(Locale.GERMAN, "(+%s)", numberFormat.format(sum_diff)));
                                } else {
                                    tvSum_Diff.setText(String.format(Locale.GERMAN, "(%s)", numberFormat.format(sum_diff)));
                                }
                            }

                            /* chart data set*/
                            BarDataSet dataSet1 = new BarDataSet(entries_01, "Group 1");
                            dataSet1.setColor(requireActivity().getColor(R.color.green));
                            dataSet1.setValueTextColor(requireActivity().getColor(R.color.green));
                            dataSet1.setValueTextSize(12f);
                            dataSet1.setDrawValues(true);
                            dataSet1.setValueFormatter(new RightAlignValueFormatter());

                            BarDataSet dataSet2 = new BarDataSet(entries_02, "Group 2");
                            dataSet2.setColor(requireActivity().getColor(R.color.blue));
                            dataSet2.setValueTextColor(requireActivity().getColor(R.color.blue));
                            dataSet2.setValueTextSize(12f);
                            dataSet2.setDrawValues(true);
                            dataSet2.setValueFormatter(new LeftAlignValueFormatter());

                            BarData data = new BarData(dataSet1, dataSet2);
//                            data.setValueFormatter(new MyValueFormatter());
//                            barChart.setRenderer(new CustomTopChartRenderer(barChart, barChart.getAnimator(), barChart.getViewPortHandler()));

                            float groupSpace = 0.35f;   // space between groups
                            float barSpace = 0.05f;     // space between bars in one group
                            float barWidth = 0.35f;     // width of each bars

                            data.setBarWidth(barWidth);
                            barChart.setData(data);
                            barChart.groupBars(0, groupSpace, barSpace);    // start at x = 0;

                            barChart.setScaleEnabled(false);
                            barChart.getXAxis().setEnabled(true);
                            barChart.getXAxis().setAxisMinimum(0);
                            barChart.getXAxis().setValueFormatter(new IndexAxisValueFormatter(labels));
                            barChart.getXAxis().setTextColor(Color.WHITE);
                            barChart.getXAxis().setPosition(XAxis.XAxisPosition.BOTTOM);
                            barChart.getXAxis().setCenterAxisLabels(true);
                            barChart.getXAxis().setGranularity(1.15f);
                            barChart.getXAxis().setGranularityEnabled(true);

                            barChart.getXAxis().setDrawGridLines(false);
                            barChart.getXAxis().setDrawLabels(true);

                            barChart.getAxisLeft().setDrawLabels(false);
                            barChart.getAxisLeft().setAxisMinimum(0f);
                            barChart.getAxisLeft().setDrawAxisLine(false);
                            barChart.getAxisLeft().setSpaceTop(18f);

                            barChart.getAxisRight().setDrawGridLines(false);
                            barChart.getAxisRight().setDrawAxisLine(false);
                            barChart.getAxisRight().setDrawLabels(true);

                            barChart.setFitBars(true);
                            barChart.setMinOffset(0);
                            barChart.setExtraOffsets(-10, 10, -30, 10);

                            barChart.setDescription(null);
                            barChart.getLegend().setEnabled(false);
                            barChart.setNoDataText("");

                            barChart.notifyDataSetChanged();
                            barChart.invalidate();
                        }

                        if (progressOverlay.getVisibility() == View.VISIBLE) {
                            progressOverlay.setVisibility(View.GONE);
                        }
                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
                }

                @Override
                public void onFailure(int statusCode, Header[] headers, byte[] responseBody, Throwable error) {
                    // When Http response code is '404'
                    if (progressOverlay.getVisibility() == View.VISIBLE) {
                        progressOverlay.setVisibility(View.GONE);
                    }

                    if (statusCode == 404) {
                        Log.e(TAG, getString(R.string.error_404));
                    }
                    // When Http response code is '500'
                    else if (statusCode == 500) {
                        Log.e(TAG, getString(R.string.error_500));
                    }

                    Toast.makeText(requireActivity().getApplicationContext(), getString(R.string.error_), Toast.LENGTH_SHORT).show();
                }
            });
        }
    }

    public static class MyValueFormatter extends ValueFormatter {
        @Override
        public String getFormattedValue(float value) {
            return String.format(Locale.GERMAN, "%,.0f", value);
        }
    }

    public static class RightAlignValueFormatter extends ValueFormatter {
        @Override
        public String getFormattedValue(float value) {
            return String.format(Locale.GERMAN, "%,.0f     ", value);
        }
    }

    public static class LeftAlignValueFormatter extends ValueFormatter {
        @Override
        public String getFormattedValue(float value) {
            return String.format(Locale.GERMAN, "     %,.0f", value);
        }
    }
}