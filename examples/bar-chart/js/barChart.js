
define(function(require, exports, module) {
  var d3            = require('d3/d3');
  var View          = require('famous/core/View');
  var Surface       = require('famous/core/Surface');
  var Transform     = require('famous/core/Transform');
  var StateModifier = require('famous/modifiers/StateModifier');
  var Easing        = require('famous/transitions/Easing');
  var Modifier      = require('famous/core/Modifier')

  var BarChart = function (chartHeight, chartWidth, xVal, yVal, data, context) {
    var tooltip = { w: 90, h: 40 }
    var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width  = chartWidth  - margin.left - margin.right,
    height = chartHeight - margin.top  - margin.bottom;

    var color = d3.scale.ordinal().range(['rgb(140,81,10)','rgb(191,129,45)','rgb(223,194,125)','rgb(128,205,193)','rgb(53,151,143)','rgb(1,102,94)']);

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    var y = d3.scale.linear()
        .range([height, 0]);

    x.domain(data.map(function (d) { return d.letter; }));
    y.domain([0, d3.max(data, function (d) { return d.frequency; })]);

    var Chart = new Surface({
      size: [chartWidth, chartHeight],
      classes: ['chart-back'],
      properties: {
        border: '3px solid grey',
        borderRadius: '8px',
        backgroundColor: 'blue'
      }
    });

    var tooltipSurface = new Surface({
      size: [tooltip.w, tooltip.h],
      classes: ['tooltip']
    });

    var tooltipModifier = new StateModifier({
      origin: [0, 0]
    });

    var getBar = function (d) {
      var surface = new Surface({
        size: [x.rangeBand(), height - y(d.frequency)],
        content: height - y(d.frequency) > 12 ? d.letter:'',
        classes: ['bar'],
        properties: {
          textAlign: 'center',
          color: 'white',
          border: '2px solid grey',
          backgroundColor: color('bars')
        }
      });

      surface._data = d;

      surface.on('mouseover', function (e) {
        var el = e.currentTarget;

        tooltipSurface.setProperties({display: 'inline'});
        tooltipSurface.setContent("Letter: " + d.letter + "<br/>" + d.frequency);

        var newX = x(d.letter) + margin.left - (tooltip.w / 2) + (x.rangeBand() / 2);
        var newY = y(d.frequency) + margin.top - tooltip.h - 15;

        tooltipModifier.setTransform(
          Transform.translate(newX, newY, 20),
          { duration : 50, curve: Easing.outCirc }
        );


        surface.setProperties({
          backgroundColor: '#878785'
        });
      });

      surface.on('mouseout', function() {
        tooltipSurface.setProperties({display: 'none'});
        surface.setProperties({
          backgroundColor: color('bars')
        });
      });

      return surface;
    };

   var getBarModifier = function (d) {
      var stateModifier = new StateModifier();

      stateModifier.setTransform(
        Transform.translate(Math.random()*10000, Math.random()*10000, Math.random()*10000),
        { duration : 500, curve: Easing.outCirc }
      );

      stateModifier.setTransform(
        Transform.translate(x(d.letter) + margin.left, y(d.frequency) + margin.top, 5),
        { duration : 500, curve: Easing.outCirc }
      );

      return stateModifier;
    };

    var view = new View({ size: [1000, 1000]});
    view.add(Chart);

    data.forEach(function (item) {
      view.add(getBarModifier(item)).add(getBar(item));
    });

    view.add(tooltipModifier).add(tooltipSurface);

    return view;
  };

  module.exports = BarChart;
});