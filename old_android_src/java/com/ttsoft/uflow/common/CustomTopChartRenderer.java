package com.ttsoft.uflow.common;

import android.graphics.Canvas;
import android.graphics.Paint;

import com.github.mikephil.charting.animation.ChartAnimator;
import com.github.mikephil.charting.interfaces.dataprovider.BarDataProvider;
import com.github.mikephil.charting.renderer.BarChartRenderer;
import com.github.mikephil.charting.utils.ViewPortHandler;

public class CustomTopChartRenderer extends BarChartRenderer {
    public CustomTopChartRenderer(BarDataProvider chart, ChartAnimator animator, ViewPortHandler viewPortHandler) {
        super(chart, animator, viewPortHandler);
    }

    @Override
    public void drawValue(Canvas c, String valueText, float x, float y, int color) {
        Paint paint = mValuePaint;
        paint.setColor(color);
        paint.setTextAlign(Paint.Align.CENTER);
//        paint.setTextSize(12f);

        c.save();
        c.rotate(-30, x, y);
        c.drawText(valueText, x + 24, y - 16, paint);
        c.restore();
    }
}
