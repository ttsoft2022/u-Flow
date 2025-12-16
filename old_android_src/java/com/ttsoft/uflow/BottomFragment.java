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
import com.github.mikephil.charting.data.BarData;
import com.github.mikephil.charting.data.BarDataSet;
import com.github.mikephil.charting.data.BarEntry;
import com.github.mikephil.charting.data.Entry;
import com.github.mikephil.charting.formatter.ValueFormatter;
import com.github.mikephil.charting.utils.ViewPortHandler;
import com.loopj.android.http.AsyncHttpClient;
import com.loopj.android.http.AsyncHttpResponseHandler;
import com.loopj.android.http.RequestParams;
import com.ttsoft.uflow.common.CustomBarRenderer;
import com.ttsoft.uflow.common.MyApplication;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Locale;

/**
 * A simple {@link Fragment} subclass.
 * Use the {@link BottomFragment#newInstance} factory method to
 * create an instance of this fragment.
 */
public class BottomFragment extends Fragment {
    private static final String TAG = "Fragment Bottom";

    public static String mUsername = "";
    public static String mNoDep = "";
    public static String mDBIP = "";
    public static String mDBName = "";
    public static String mDBUsername = "";
    public static String mDBPassword = "";
    public static String mServerIP = "";
    public static String mApiName = "";

    private TextView tvMax;
    private TextView tvMin;

    private BarChart barChart;

    // TODO: Rename parameter arguments, choose names that match
    // the fragment initialization parameters, e.g. ARG_ITEM_NUMBER
    private static final String ARG_PARAM1 = "type";

    // TODO: Rename and change types of parameters
    private int mType;

    public BottomFragment() {
        // Required empty public constructor
    }

    /**
     * Use this factory method to create a new instance of
     * this fragment using the provided parameters.
     *
     * @param param1 Parameter 1.
     * @return A new instance of fragment BottomFragment.
     */
    // TODO: Rename and change types and number of parameters
    public static BottomFragment newInstance(int param1) {
        BottomFragment fragment = new BottomFragment();
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
        View view = inflater.inflate(R.layout.fragment_bottom, container, false);

        TextView tvHeader = view.findViewById(R.id.tv_fragment_bottom_title);

        TextView tvDesc = view.findViewById(R.id.tv_fragment_bottom_desc);
        tvDesc.setText(String.format(Locale.GERMAN, "(%s)", getString(R.string.text_description)));

        TextView tvSub01 = view.findViewById(R.id.tv_fragment_bottom_max_label);
        tvSub01.setText(getString(R.string.text_max));

        TextView tvSub02 = view.findViewById(R.id.tv_fragment_bottom_min_label);
        tvSub02.setText(getString(R.string.text_min));

        tvMax = view.findViewById(R.id.tv_fragment_bottom_max);
        tvMax.setText("");

        tvMin = view.findViewById(R.id.tv_fragment_bottom_min);
        tvMin.setText("");

        barChart = view.findViewById(R.id.barchart_bottom);

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
                tvHeader.setText(getResources().getString(R.string.bottom_tab_01_title));
            } else if (mType == 2) {
                tvHeader.setText(getResources().getString(R.string.bottom_tab_02_title));
            } else if (mType == 3) {
                tvHeader.setText(getResources().getString(R.string.bottom_tab_03_title));
            } else {
                tvHeader.setText(getResources().getString(R.string.bottom_tab_04_title));
            }
            loadChart(mNoDep, strDate, strDate, mType);
        }

        return view;

    }

    public void loadChart(String aNoDep, String aFDate, String aTDate,
                          int aType) {

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
            client.setTimeout(15000);
            client.get("http://" + mServerIP + "/" + mApiName + "/general/flow/getflowchart15", params, new AsyncHttpResponseHandler() {
                @Override
                public void onSuccess(int statusCode, cz.msebera.android.httpclient.Header[] headers, byte[] responseBody) {
                    try {
                        // array list to store chart data
                        ArrayList<BarEntry> entries = new ArrayList<>();
                        ArrayList<String> labels = new ArrayList<>();

                        // JSON Object
                        JSONObject obj = new JSONObject(new String(responseBody));
                        JSONArray jArr = obj.getJSONArray("list");

                        // get first value as base value
                        obj = jArr.getJSONObject(0);
                        int maxQty = (int) obj.getDouble("QTY");
                        int minQty = (int) obj.getDouble("QTY");

                        if (jArr.length() > 0) {
                            for (int i = 0; i < jArr.length(); i++) {
                                obj = jArr.getJSONObject(i);
                                int qty = (int) obj.getDouble("QTY");
                                int ordinal = obj.getInt("ORDINAL");
                                entries.add(new BarEntry(ordinal, qty));

                                if (qty > maxQty) {
                                    maxQty = qty;
                                }
                                if (qty < minQty) {
                                    minQty = qty;
                                }
                            }

                            tvMax.setText(String.valueOf(maxQty));
                            tvMin.setText(String.valueOf(minQty));

                            /* chart data set*/
                            BarDataSet dataset = new BarDataSet(entries, "# of Output");
                            dataset.setColor(requireActivity().getColor(R.color.green));
                            dataset.setValueTextColor(Color.WHITE);
                            dataset.setDrawValues(false);

                            BarData data = new BarData(dataset);
                            data.setValueFormatter(new MyValueFormatter());

                            barChart.setRenderer(new CustomBarRenderer(barChart, barChart.getAnimator(), barChart.getViewPortHandler()));
                            barChart.setData(data);
                            barChart.notifyDataSetChanged();
                            barChart.invalidate();
                            barChart.setScaleEnabled(false);
                            barChart.getXAxis().setEnabled(false);
                            barChart.getAxisLeft().setDrawGridLines(true);
                            barChart.getAxisLeft().setDrawAxisLine(false);
                            barChart.getAxisLeft().setDrawLabels(false);
                            barChart.getAxisRight().setDrawGridLines(false);
                            barChart.getAxisRight().setDrawAxisLine(false);
                            barChart.getAxisRight().setDrawLabels(false);

                            // show full of bar from the root (0)
                            barChart.getAxisLeft().setAxisMinimum(0f);

                            barChart.setDescription(null);
                            barChart.getLegend().setEnabled(false);
                            barChart.setNoDataText("");
                        }
                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
                }

                @Override
                public void onFailure(int statusCode, cz.msebera.android.httpclient.Header[] headers, byte[] responseBody, Throwable error) {
                    // When Http response code is '404'
                    if (statusCode == 404) {
                        Log.e(TAG, getString(R.string.error_404));
                    }
                    // When Http response code is '500'
                    else if (statusCode == 500) {
                        Log.e(TAG, getString(R.string.error_500));
                    }

                    Toast.makeText(getActivity().getApplicationContext(), getString(R.string.error_), Toast.LENGTH_SHORT).show();
                }
            });
        }
    }

    public static class MyValueFormatter extends ValueFormatter {
        @Override
        public String getFormattedValue(float value, Entry entry, int dataSetIndex, ViewPortHandler viewPortHandler) {
            return String.format(Locale.GERMAN, "%.2f", value);
        }
    }
}