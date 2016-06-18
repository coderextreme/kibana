import VislibLibHandlerHandlerProvider from 'ui/vislib/lib/handler/handler';
import VislibLibDataProvider from 'ui/vislib/lib/data';
import VislibLibChartTitleProvider from 'ui/vislib/lib/chart_title';

export default function CrossHandler(Private) {
  let Handler = Private(VislibLibHandlerHandlerProvider);
  let Data = Private(VislibLibDataProvider);
  let ChartTitle = Private(VislibLibChartTitleProvider);

  /*
   * Handler for Cross visualizations.
   */

  return function (vis) {
    return new Handler(vis, {
      chartTitle: new ChartTitle(vis.el)
    });
  };
};
