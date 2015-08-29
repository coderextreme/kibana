define(function (require) {
  return function CrossChartFactory(Private) {
    var d3 = require('d3');
    var x3dom = require('x3dom/dist/x3dom-kibana');
    var _ = require('lodash');
    var $ = require('jquery');

    var Chart = Private(require('ui/vislib/visualizations/_chart'));
    var errors = require('ui/errors');

    /**
     * Cross Chart Visualization
     *
     * @class CrossChart
     * @constructor
     * @extends Chart
     * @param handler {Object} Reference to the Handler Class Constructor
     * @param el {HTMLElement} HTML element to which the chart will be appended
     * @param chartData {Object} Elasticsearch query results for this specific chart
     */
    _.class(CrossChart).inherits(Chart);
    function CrossChart(handler, chartEl, chartData) {
      if (!(this instanceof CrossChart)) {
        return new CrossChart(handler, chartEl, chartData);
      }
      CrossChart.Super.apply(this, arguments);

      var charts = this.handler.data.getVisData();
      this._validateCrossData(charts);

      this._attr = _.defaults(handler._attr || {}, {
        isDonut: handler._attr.isDonut || false
      });
    }

    /**
     * Checks whether cross slices have all zero values.
     * If so, an error is thrown.
     */
    CrossChart.prototype._validateCrossData = function (charts) {
      var isAllZeros = charts.every(function (chart) {
        return chart.slices.children.length === 0;
      });

      if (isAllZeros) { throw new errors.PieContainsAllZeros(); }
    };

    /**
     * Adds Events to SVG paths
     *
     * @method addPathEvents
     * @param element {D3.Selection} Reference to SVG path
     * @returns {D3.Selection} SVG path with event listeners attached
     */
    CrossChart.prototype.addPathEvents = function (element) {
      var events = this.events;

      return element
        .call(events.addHoverEvent())
        .call(events.addMouseoutEvent())
        .call(events.addClickEvent());
    };

    CrossChart.prototype.convertToPercentage = function (slices) {
      (function assignPercentages(slices) {
        if (slices.sumOfChildren != null) return;

        var parent = slices;
        var children = parent.children;
        var parentPercent = parent.percentOfParent;

        var sum = parent.sumOfChildren = Math.abs(children.reduce(function (sum, child) {
          return sum + Math.abs(child.size);
        }, 0));

        var innerSum = 0;
        children.forEach(function (child) {
          child.innerRadius = innerSum / sum;
          child.outerRadius = Math.abs(child.size) / sum + child.innerRadius;
          innerSum += Math.abs(child.size);
          child.percentOfGroup = Math.abs(child.size) / sum;
          child.percentOfParent = child.percentOfGroup;

          if (parentPercent != null) {
            child.percentOfParent *= parentPercent;
          }

          if (child.children) {
            assignPercentages(child);
          }
        });
      }(slices));
    };

    /**
     * Adds cross paths to SVG
     *
     * @method addPath
     * @param width {Number} Width of SVG
     * @param height {Number} Height of SVG
     * @param scene {HTMLElement} Chart Scene
     * @param slices {Object} Chart data
     * @returns {D3.Selection} SVG with paths attached
     */
    CrossChart.prototype.addPath = function (width, height, scene, slices) {
      var self = this;
      var marginFactor = 0.95;
      var isDonut = self._attr.isDonut;
      var radius = (Math.min(width, height) / 2) * marginFactor;
      var color = self.handler.data.getCrossColorFunc();
      var tooltip = self.tooltip;
      var isTooltip = self._attr.addTooltip;

      var partition = d3.layout.partition()
      .sort(null)
      .value(function (d) {
        return d.percentOfParent * 100;
      });


      var disktransform = scene.selectAll('.disktransform');
      var shape = disktransform
                      .datum(slices)
                      .selectAll('.shape')
                      .data(partition.nodes)
                .enter()
                .append('shape')
                        .attr('class', 'shape');

      shape
                .append('appearance')
                .append('material')
                        .attr('diffuseColor', function (d, i) { return color(d.name); })
        ;
      var disk2d = shape
                .append('disk2d')
                        .attr('solid', 'false')
                        .attr('class', 'disk2d')
                        .attr('innerRadius', function (d, i) {
                                if (i === 0) {
                                  d.innerRadius = 0;
                                }
                                console.log(d.innerRadius, d.outerRadius);
                                return d.innerRadius;
                              })
                        .attr('outerRadius', function (d, i) {
                                if (i === 0) {
                                  d.outerRadius = 0;
                                }
                                console.log(d.innerRadius, d.outerRadius);
                                return d.outerRadius;
                              })
        ;

      if (isTooltip) {
        disk2d.call(tooltip.render());
      }

      return disk2d;
    };

    CrossChart.prototype._validateContainerSize = function (width, height) {
      var minWidth = 20;
      var minHeight = 20;

      if (width <= minWidth || height <= minHeight) {
        throw new errors.ContainerTooSmall();
      }
    };

    CrossChart.prototype.render = function () {
      var selection = d3.select(this.chartEl);

      var scene = selection.select('Scene').selectAll('*').remove();
      selection.call(this.draw());
    };
    CrossChart.prototype.destroy = function () {
      var selection = d3.select(this.chartEl);
      this.events.removeAllListeners();
      if (this.tooltip) this.tooltip.hide();
      selection.select('Scene').selectAll('*').remove();
    };
    /**
     * Renders d3 visualization
     *
     * @method draw
     * @returns {Function} Creates the cross chart
     */
    CrossChart.prototype.draw = function () {
      var self = this;

      return function (selection) {
        selection.each(function (data) {
          var slices = data.slices;
          var width = $(this).width();
          var height = $(this).height();
          var x3d = selection.append('X3D')
                .attr('profile', 'Interchange')
                .attr('version', '3.3')
                .attr('xsd:noNamespaceSchemaLocation', 'http://www.web3d.org/specifications/x3d-3.3.xsd')
                .attr('height', height)
                .attr('width', width)
                .attr('showStat', 'false')
                .attr('showLog', 'false');
          var scene = x3d.append('Scene');
          document._bindableBag = new x3dom.BindableBag(scene.node());
          document._bindableBag.setRefNode(scene.node());
          var path;

          if (!slices.children.length) return;

          self.convertToPercentage(slices);
          self._validateContainerSize(width, height);

          var data = [
            {
              trx:0, try:0, trz:1, tr:1.5708,
              hrx:1, hry:0, hrz:0, hr:-1.5708
            },
            {
              trx:1, try:0, trz:0, tr:1.5708,
              hrx:0, hry:0, hrz:1, hr:1.5708
            },
            {
              trx:1, try:0, trz:0, tr:0,
              hrx:1, hry:0, hrz:0, hr:3.1416
            }
          ]
          ;

          var transform = scene
            .append('transform')
                .attr('scale', '2 2 2')
                .attr('rotation', '1 0 0 0.3927')
            .append('transform')
                .attr('rotation', '0 1 0 -0.7854')
          ;
          var disktransform = transform.selectAll('.hemitransform')
            .data(data)
            .enter()
            .append('transform')
                .attr('class', 'hemitransform')
                .attr('rotation', function (d) { return [d.trx, d.try, d.trz, d.tr ].join(' '); })
            .append('transform')
                .attr('rotation', function (d) { return [d.hrx, d.hry, d.hrz, d.hr ].join(' '); })
            .append('shape')
            .append('appearance')
            .append('material')
                .attr('diffuseColor', '0.2 0.8 0.8')
            .select(function () { return this.parentNode; })
            .select(function () { return this.parentNode; })
            .append('dish')
                .attr('bottom', 'false')
            .select(function () { return this.parentNode; })
            .select(function () { return this.parentNode; })
            .append('transform')
                .attr('class', 'disktransform')
                .attr('rotation', '1 0 0 -1.5708')
          ;
          path = self.addPath(width, height, scene, slices);
          self.addPathEvents(path);


          return scene;
        });
        x3dom.reload();
      };
    };

    return CrossChart;
  };
});
