
define(function(require, exports, module) {
  var d3            = require('d3/d3');
  var View          = require('famous/core/View');
  var Surface       = require('famous/core/Surface');
  var Transform     = require('famous/core/Transform');
  var StateModifier = require('famous/modifiers/StateModifier');
  var Easing        = require('famous/transitions/Easing');
  var Modifier      = require('famous/core/Modifier');

  var createBubbleView = function (diameter, data) {
    var tooltip = { w: 90, h: 40 };
    var margins = {t: 50, r: 200, b: 20, l: 200};
    var viewWidth  = diameter + margins.l + margins.r;
    var viewHeight = diameter + margins.t + margins.b;

    var format = d3.format(",d");
    var color = d3.scale.ordinal().range(['rgb(140,81,10)','rgb(191,129,45)','rgb(223,194,125)','rgb(128,205,193)','rgb(53,151,143)','rgb(1,102,94)']);

    var bubble = d3.layout.pack()
        .sort(function (d) { return d.comb})
        .size([diameter, diameter])
        .padding(1.5)

    for (var i = 0; i < data.length; i++) {
      data[i].comb = +data[i].comb;
      data[i].value = data[i].comb;
    }

    bubble.nodes({children: data});

    // console.log("l", data);

    var background = new Surface({
      size: [viewWidth, viewHeight],
      properties: {
        backgroundColor: '#A2B5CD'
      }
    });

    var getBubble = function (d) {
      return new Surface({
        size: [d.r*2, d.r*2],
        content: d.r > 12 ? d.make + '<br/>' + d.model:'',
        classes: ['bubble'],
        properties: {
          fontSize: '9px',
          borderRadius: d.r + 'px',
          textAlign: 'center',
          color: 'white',
          border: '2px solid grey',
          backgroundColor: color(d.make)
        }
      });
    };

    var getBubbleModifier = function (d, i) {
      var modifier = new StateModifier({
        align: [0, 0],
        origin: [0.5, 0.5]
      });

      modifier.setTransform(
        Transform.translate(d.x + 2000, d.y + margins.t, 2),
        { duration : 0 , curve: Easing.inOutElastic }
      );
      modifier.setTransform(
        Transform.translate(d.x + margins.l, d.y + margins.t, 2),
        { duration : i * 30 + 30, curve: Easing.inOutElastic }
      );

      return modifier;
    };

    var view = new View({size: [viewWidth, viewHeight]});
    view.add(background);

    data.forEach(function (item, index) {
      view.add(getBubbleModifier(item, index)).add(getBubble(item));
    });

    //view.add(tooltipModifier).add(tooltipSurface);

    return view;
  };
  //   var tooltip = { w: 90, h: 40 };
  //   var margins = {t: 50, r: 20, b: 30, l: 40};
  //   var width  = viewWidth  - margins.l - margins.r;
  //   var height = viewHeight - margins.t - margins.b;

  //   var x = d3.scale.ordinal()
  //       .rangeRoundBands([0, width], .1);

  //   var y = d3.scale.linear()
  //       .range([height, 0]);

  //   x.domain(data.map(function (d) { return d.letter; }));
  //   y.domain([0, d3.max(data, function (d) { return d.frequency; })]);

  //   var background = new Surface({
  //     size: [viewWidth, viewHeight],
  //     properties: {
  //       border: '3px solid white',
  //       borderRadius: '8px',
  //       backgroundColor: '#696758'
  //     }
  //   });

  //   var tooltipSurface = new Surface({
  //     size: [tooltip.w, tooltip.h],
  //     classes: ['tooltip']
  //   });

  //   var tooltipModifier = new StateModifier({
  //     origin: [0, 0]
  //   });

  //   var getBar = function (d) {
  //     var bar = new Surface({
  //       size: [x.rangeBand(), height - y(d.frequency)],
  //       content: height - y(d.frequency) > 12 ? (d.letter):'',
  //       classes: ['bar'],
  //       properties: {
  //         textAlign: 'center',
  //         color: '#36393B',
  //         border: '2px solid white',
  //         backgroundColor: '#EEE6AB'
  //       }
  //     });

  //     bar.on('mouseover', function (e) {
  //       var newX, newY;

  //       tooltipSurface.setProperties({display: 'inline'});
  //       tooltipSurface.setContent("Letter: " + d.letter + "<br/>" + d3.format('.2p')(d.frequency));

  //       newX = x(d.letter) + margins.l - (tooltip.w / 2) + (x.rangeBand() / 2);
  //       newY = y(d.frequency) + margins.t - tooltip.h - 15;

  //       tooltipModifier.setTransform(
  //         Transform.translate(newX, newY, 2),
  //         { duration : 50, curve: Easing.outCirc }
  //       );

  //       this.setProperties({
  //         backgroundColor: '#C5BC8E'
  //       });
  //     });

  //     bar.on('mouseout', function() {
  //       tooltipSurface.setProperties({display: 'none'});
  //       this.setProperties({
  //         backgroundColor: '#EEE6AB'
  //       });
  //     });

  //     return bar;
  //   };

  //   var getBarModifier = function (d, i) { 
  //     var modifier = new StateModifier();
  //     modifier.setTransform(
  //       Transform.translate(x(d.letter) + 1000, y(d.frequency) + margins.t, 1),
  //       { duration : 0 , curve: Easing.inOutElastic }
  //     );
  //     modifier.setTransform(
  //       Transform.translate(x(d.letter) + margins.l, y(d.frequency) + margins.t, 1),
  //       { duration : i * 100 + 30, curve: Easing.inOutElastic }
  //     );

  //     return modifier;
  //   };

  //   var view = new View({size: [viewWidth, viewHeight]});
  //   view.add(background);

  //   data.forEach(function (item, index) {
  //     view.add(getBarModifier(item, index)).add(getBar(item));
  //   });

  //   view.add(tooltipModifier).add(tooltipSurface);

  //   return view;
  // };
  
  module.exports = createBubbleView;
});