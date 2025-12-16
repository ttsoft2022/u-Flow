package com.ttsoft.uflow.adapter;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentActivity;
import androidx.viewpager2.adapter.FragmentStateAdapter;

import com.ttsoft.uflow.BottomFragment;

public class BottomPagerAdapter extends FragmentStateAdapter {
    public BottomPagerAdapter(@NonNull FragmentActivity fragmentActivity) {
        super(fragmentActivity);
    }

    @NonNull
    @Override
    public Fragment createFragment(int position) {
        return BottomFragment.newInstance(position + 1);
    }

    @Override
    public int getItemCount() {
        return 4;
    }

}
