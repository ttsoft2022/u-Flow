package com.ttsoft.uflow.adapter;

import android.os.Bundle;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentActivity;
import androidx.viewpager2.adapter.FragmentStateAdapter;

import com.ttsoft.uflow.TopFragment;

public class TopPagerAdapter extends FragmentStateAdapter {
    public TopPagerAdapter(@NonNull FragmentActivity fragmentActivity) {
        super(fragmentActivity);
    }

    @NonNull
    @Override
    public Fragment createFragment(int position) {
        TopFragment fragment = new TopFragment();
        Bundle bundle = new Bundle();

        // Pass params according to tab position
        bundle.putInt("type", position + 1);

        fragment.setArguments(bundle);
        return fragment;
    }


    @Override
    public int getItemCount() {
        return 3;
    }


}
