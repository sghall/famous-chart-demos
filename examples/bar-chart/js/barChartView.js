
define(function(require, exports, module) {
  var d3            = require('d3/d3');
  var View          = require('famous/core/View');
  var Surface       = require('famous/core/Surface');
  var Transform     = require('famous/core/Transform');
  var StateModifier = require('famous/modifiers/StateModifier');
  var Easing        = require('famous/transitions/Easing');
  var Modifier      = require('famous/core/Modifier');

  var createBarView = function (viewHeight, viewWidth, data) {
    var tooltip = { w: 90, h: 40 };
    var margins = {t: 50, r: 20, b: 30, l: 40};
    var width  = viewWidth  - margins.l - margins.r;
    var height = viewHeight - margins.t - margins.b;

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    var y = d3.scale.linear()
        .range([height, 0]);

    x.domain(data.map(function (d) { return d.letter; }));
    y.domain([0, d3.max(data, function (d) { return d.frequency; })]);

    var background = new Surface({
      size: [viewWidth, viewHeight],
      properties: {
        backgroundColor: '#fff',
        border: '1px solid #6E7577',
        borderRadius: '8px'
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
      var bar = new Surface({
        size: [x.rangeBand(), height - y(d.frequency)],
        content: height - y(d.frequency) > 12 ? (d.letter):'',
        classes: ['bar'],
        properties: {
          textAlign: 'center',
          color: '#FFFBF7',
          border: '2px solid #A5A9AA',
          backgroundColor: '#36211C'
        }
      });

      bar.on('mouseover', function (e) {
        var newX, newY;

        tooltipSurface.setProperties({display: 'inline'});
        tooltipSurface.setContent("Letter: " + d.letter + "<br/>" + d3.format('.2p')(d.frequency));

        newX = x(d.letter) + margins.l - (tooltip.w / 2) + (x.rangeBand() / 2);
        newY = y(d.frequency) + margins.t - tooltip.h - 15;

        tooltipModifier.setTransform(
          Transform.translate(newX, newY, 2),
          { duration : 50, curve: Easing.outCirc }
        );

        this.setProperties({
          backgroundColor: '#897D7A'
        });
      });

      bar.on('mouseout', function() {
        tooltipSurface.setProperties({display: 'none'});
        this.setProperties({
          backgroundColor: '#36211C'
        });
      });

      return bar;
    };

    var getBarModifier = function (d, i) { 
      var modifier = new StateModifier();
      modifier.setTransform(
        Transform.translate(x(d.letter) + 1000, y(d.frequency) + margins.t, 1),
        { duration : 0 , curve: Easing.inOutElastic }
      );
      modifier.setTransform(
        Transform.translate(x(d.letter) + margins.l, y(d.frequency) + margins.t, 1),
        { duration : i * 100 + 30, curve: Easing.inOutElastic }
      );

      return modifier;
    };

    var view = new View({size: [viewWidth, viewHeight]});
    view.add(background);

    data.forEach(function (item, index) {
      view.add(getBarModifier(item, index)).add(getBar(item));
    });

    view.add(tooltipModifier).add(tooltipSurface);

    return view;
  };
  
  module.exports = createBarView;
});