
define(function(require, exports, module) {
  var d3            = require('d3/d3')
  var Surface       = require('famous/core/Surface');
  var Transform     = require('famous/core/Transform');
  var StateModifier = require('famous/modifiers/StateModifier');
  var Easing        = require('famous/transitions/Easing');
  var Modifier      = require('famous/core/Modifier')

  var BarChart = function (chartHeight, chartWidth, xVal, yVal, data, context) {

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
      properties: {
        backgroundColor: '#A2B5CD'
      }
    });

    var getBar = function (d) {
      return new Surface({
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
    };

   var getBarModifier = function (d) {
      var stateModifier = new StateModifier();

      stateModifier.setTransform(
        Transform.translate(Math.random()*width, Math.random()*height, 0),
        { duration : 1000, curve: Easing.outCirc }
      );

      stateModifier.setTransform(
        Transform.translate(x(d.letter) + margin.left, y(d.frequency) + margin.top, 0),
        { duration : 800, curve: Easing.outCirc }
      );

      return stateModifier;
    };

    var ChartBody = context.add(Chart);

    data.forEach(function (item) {
      console.log(item);
      context.add(getBarModifier(item)).add(getBar(item));
    });

  };

  module.exports = BarChart;
});