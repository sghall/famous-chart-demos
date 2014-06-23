
define(function(require, exports, module) {
  var d3            = require('d3/d3');
  var View          = require('famous/core/View');
  var Surface       = require('famous/core/Surface');
  var Transform     = require('famous/core/Transform');
  var StateModifier = require('famous/modifiers/StateModifier');
  var Easing        = require('famous/transitions/Easing');
  var Modifier      = require('famous/core/Modifier');

  var createBubbleView = function (viewSize, data) {
    var tooltip  = { w: 150, h: 60 };
    var margins  = {t: 50, r: 150, b: 20, l: 150};

    var dim1 = viewSize[0] - margins.l - margins.r;
    var dim2 = viewSize[1] - margins.t - margins.b;
    var diameter = dim1 < dim2 ? dim1: dim2;

    var format = d3.format(",d");
    var color = d3.scale.ordinal().range(['#58625C','#4C5355','#89817A','#36211C','#A5A9AA']);

    var bubble = d3.layout.pack()
        .sort(function (d) { return d.comb})
        .size([diameter, diameter])
        .padding(1.5)

    for (var i = 0; i < data.length; i++) {
      data[i].comb = +data[i].comb;
      data[i].value = data[i].comb;
    }

    bubble.nodes({children: data});

    var background = new Surface({
      size: viewSize,
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

    var getBubble = function (d) {
      var bubble = new Surface({
        size: [d.r * 2, d.r * 2],
        content: d.r > 10 ? d.make:'',
        properties: {
          fontSize: '9px',
          borderRadius: '50%',
          textAlign: 'center',
          color: 'white',
          border: '1px solid #121E21',
          backgroundColor: color(d.make)
        }
      });

      bubble.on('mouseover', function (e) {
        var newX, newY;

        tooltipSurface.setProperties({display: 'inline'});

        var text = d.make + "<br/>" + d.model.slice(0,20) + "<br/>MPG: " + d.comb + "<br/>" + d.trany.slice(0,21);
        tooltipSurface.setContent(text);

        newX = d.x + margins.l - (tooltip.w / 2) + d.r;
        newY = d.y + margins.t - tooltip.h - 20;

        tooltipModifier.setTransform(
          Transform.translate(newX, newY, 2),
          { duration : 50, curve: Easing.outCirc }
        );

        this.setProperties({
          backgroundColor: '#A5A9AA'
        });
      });

      bubble.on('mouseout', function() {
        tooltipSurface.setProperties({display: 'none'});
        this.setProperties({
          backgroundColor: color(d.make)
        });
      });

      return bubble;
    };

    var getBubbleModifier = function (d, i) {
      var modifier = new StateModifier({
        align: [0, 0],
        origin: [0.5, 0.5]
      });

      modifier.setTransform(
        Transform.translate(d.x + 2000, d.y + margins.t, 1),
        { duration : 0 , curve: Easing.inOutElastic }
      );
      modifier.setTransform(
        Transform.translate(d.x + margins.l, d.y + margins.t, 1),
        { duration : i * 30 + 30, curve: Easing.inOutElastic }
      );

      return modifier;
    };

    var view = new View({size: viewSize});
    view.add(background);
    view.add(tooltipModifier).add(tooltipSurface);
    data.forEach(function (item, index) {
      view.add(getBubbleModifier(item, index)).add(getBubble(item));
    });

    return view;
  };
  
  module.exports = createBubbleView;
});