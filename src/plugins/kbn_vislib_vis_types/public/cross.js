define(function (require) {
  return function TileMapVisType(Private, getAppState, courier, config) {
    var VislibVisType = Private(require('ui/vislib_vis_type/VislibVisType'));
    var Schemas = Private(require('ui/Vis/Schemas'));
    var geoJsonConverter = Private(require('ui/agg_response/geo_json/geo_json'));
    var _ = require('lodash');
    var supports = require('ui/utils/supports');

    return new VislibVisType({
      name: 'cross',
      title: 'Cross section',
      icon: 'fa-map-marker',
      description: 'A cross section of the earth similar to a pie chart',
      params: {
        defaults: {
          shareYAxis: true,
          addTooltip: true,
          addLegend: true,
          isDonut: false
        },
        editor: require('plugins/kbn_vislib_vis_types/editors/pie.html')
      },
      responseConverter: false,
      hierarchicalData: true,
      schemas: new Schemas([
        {
          group: 'metrics',
          name: 'metric',
          title: 'Slice Size',
          min: 1,
          max: 1,
          aggFilter: ['sum', 'count', 'cardinality'],
          defaults: [
            { schema: 'metric', type: 'count' }
          ]
        },
        {
          group: 'buckets',
          name: 'segment',
          icon: 'fa fa-scissors',
          title: 'Split Slices',
          min: 0,
          max: Infinity,
          aggFilter: '!geohash_grid'
        },
        {
          group: 'buckets',
          name: 'split',
          icon: 'fa fa-th',
          title: 'Split Chart',
          mustBeFirst: true,
          min: 0,
          max: 1,
          aggFilter: '!geohash_grid'
        }
      ])
    });
  };
});
