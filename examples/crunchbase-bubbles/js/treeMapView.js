
define(function(require, exports, module) {
  var d3            = require('d3/d3');
  var View          = require('famous/core/View');
  var Surface       = require('famous/core/Surface');
  var Transform     = require('famous/core/Transform');
  var StateModifier = require('famous/modifiers/StateModifier');
  var Easing        = require('famous/transitions/Easing');
  var Modifier      = require('famous/core/Modifier');

  var treeMapView = function (viewSize, groups, data, title) {
    var tooltip  = { w: 150, h: 60 };
    var margins  = {t: 50, r: 130, b: 20, l: 130};
    var view = new View({size: viewSize});
    var counter = 0;
    var format = d3.format(",")

    var dim1 = viewSize[0] - margins.l - margins.r;
    var dim2 = viewSize[1] - margins.t - margins.b;
    var diameter = dim1 < dim2 ? dim1: dim2;
    var color = d3.scale.ordinal().range(['#4C5355','#E2BF7A','#36211C','#4C838A','#723E0F','#586C97','#AA8439']);

    var bubble = d3.layout.pack()
        .sort(function (d) { return d.comb })
        .size([diameter, diameter])
        .padding(1.5)

    for (var i = 0; i < data.length; i++) {
      data[i].Amount = +data[i].Amount;
      data[i].value  = data[i].Amount;
    }
    console.log(data);

    var formatJSON = function (csvData, groups) {

      var genGroups = function(data) {
        return _.map(data, function(element, index) {
          return { name : index, children : element };
        });
      };

      var nest = function(node, curIndex) {
        if (curIndex === 0) {
          node.children = genGroups(_.groupBy(csvData, groups[0]));
          _.each(node.children, function (child) {
            nest(child, curIndex + 1);
          });
        }
        else {
          if (curIndex < groups.length) {
            node.children = genGroups(
              _.groupBy(node.children, groups[curIndex])
            );
            _.each(node.children, function (child) {
              nest(child, curIndex + 1);
            });
          }
        }
        return node;
      };
      return nest({}, 0);
    };

    var root = formatJSON(data, groups);
    bubble.nodes(root);

    var background = new Surface({
      size: viewSize,
      properties: {
        backgroundColor: '#fff',
        border: '1px solid #6E7577',
        borderRadius: '8px'
      }
    });

    var titleSurface = new Surface({
      size: [viewSize[1],margins.t],
      classes: ['title'],
      content: 'Company Region: ' + title,
      properties: {
        zIndex: 5,
        fontSize: '20px',
        textAlign: 'center',
        color: 'black',
      }
    });

    var titleModifier = new StateModifier({
      origin: [0.10, 0]
    });

    var tooltipSurface = new Surface({
      size: [tooltip.w, tooltip.h],
      classes: ['tooltip']
    });

    var tooltipModifier = new StateModifier({
      origin: [0, 0]
    });

    var getColor = function (d) {
      if (d.depth === 0) {
        return '#C0B9B2';
      } else if (d.depth === 1){
        return '#FFFFFF';
      } else {
        return color(d.Funding);
      }
    }

    var getBubble = function (d) {
      var bubble = new Surface({
        size: [d.r * 2, d.r * 2],
        content: d.Market,
        properties: {
          fontSize: '9px',
          borderRadius: '50%',
          textAlign: 'center',
          color: 'white',
          border: '1px solid #121E21',
          backgroundColor: getColor(d)
        }
      });

      bubble.on('mouseover', function (e) {
        var newX, newY;
        if (d.depth > 1) {
          tooltipSurface.setProperties({display: 'inline'});

          var text = d.Region + "<br/>" + d.Market + "<br/>" + d.Funding + "<br/>$" + format(d.Amount);
          tooltipSurface.setContent(text);

          newX = d.x + margins.l - (tooltip.w / 2) + d.r;
          newY = d.y + margins.t - tooltip.h - 20;

          tooltipModifier.setTransform(
            Transform.translate(newX, newY, 10),
            { duration : 50, curve: Easing.outCirc }
          );

          this.setProperties({
            backgroundColor: '#C0B5B2'
          });
        }
      });

      bubble.on('mouseout', function() {
        tooltipSurface.setProperties({display: 'none'});
        this.setProperties({
          backgroundColor: getColor(d)
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
        Transform.translate(d.x + 2000, d.y + margins.t, d.depth + 2),
        { duration : 0 , curve: Easing.inOutElastic }
      );
      modifier.setTransform(
        Transform.translate(d.x + margins.l, d.y + margins.t, d.depth + 2),
        { duration : i * 30 + 30, curve: Easing.inOutElastic }
      );

      return modifier;
    };

    var recurseBubbles = function (node) {
      view.add(getBubbleModifier(node, counter++)).add(getBubble(node));
      if (node.children) {
        for (var i = 0; i < node.children.length; i++) {
          recurseBubbles(node.children[i]);
        }
      }
    };

    view.add(background);
    view.add(tooltipModifier).add(tooltipSurface);
    view.add(titleModifier).add(titleSurface);


    recurseBubbles(root);

    return view;
  };
  
  module.exports = treeMapView;
});