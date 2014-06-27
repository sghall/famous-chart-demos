define(function(require, exports, module) {
  'use strict';
  var d3             = require('d3/d3');
  var View           = require('famous/core/View');
  var Surface        = require('famous/core/Surface');
  var Transform      = require('famous/core/Transform');
  var StateModifier  = require('famous/modifiers/StateModifier');
  var Timer          = require('famous/utilities/Timer')

  window.d3 = d3;

  var color = d3.scale.ordinal().range(['#586C97','#AA8439','#4C5355','#E2BF7A','#36211C','#4C838A','#723E0F']);
  var tooltip  = { w: 150, h: 60 }, padding = 1, prerender, maxRadius, data;

  var tooltipSurface = new Surface({
    size: [tooltip.w, tooltip.h],
    classes: ['tooltip']
  });

  var tooltipModifier = new StateModifier({
    origin: [0, 0]
  });

  var getBubble = function (d) {
    var bubble = new Surface({
      origin: [0.5, 0.5],
      size : [d.radius * 2, d.radius * 2],
      classes: ['bubble'],
      properties : {
          zIndex: -50,
          background : color(d.make),
          borderRadius : '50%',
          border: '2px solid #fff'
      }
    });

    bubble.on('mouseover', function (e) {
      var newX, newY, text;

      text = d.make + "<br/>" + d.model.slice(0,20) + "<br/>MPG: " + d.comb + "<br/>" + d.trany.slice(0,21);
      tooltipSurface.setContent(text);
      tooltipSurface.setProperties({display: 'inline'});
      newX = d.x - (tooltip.w / 2);
      newY = d.y - tooltip.h - 20;

      tooltipModifier.setTransform(
        Transform.translate(newX, newY, 40),
        { duration : 50, curve: 'linear' }
      );

      this.setProperties({
        backgroundColor: '#C0B5B2'
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
      origin: [0.5, 0.5],
      opacity: .75
    });

    modifier.setTransform(
      Transform.translate(d.x, d.y, 1),
      {duration : 10, curve: 'linear'}
    );

    return modifier;
  };

  var createView = function (size, input) {
    var view = new View({size: size});
    view.add(tooltipModifier).add(tooltipSurface);

    var svg = '<svg id="bg-svg" width="' + size[0] + '" height="' + size[1] + '"></svg>'
    var svgContainer = new Surface({
      size: [undefined, undefined],
      content: svg,
      properties: {
        zIndex: -20
      }
    });
    view.add(svgContainer);

    data = input;

    for (var j = 0; j < data.length; j++) {
      data[j].radius = +data[j].comb * .5;
      data[j].x = Math.random() * size[0];
      data[j].y = Math.random() * size[1];
      data[j].surface = getBubble(data[j]);
      data[j].modifier = getBubbleModifier(data[j], j);
      view.add(data[j].modifier).add(data[j].surface);
    }
    maxRadius = d3.max(_.pluck(data, 'radius'));

    return view;
  }

  var getCenters = function (vname, size) {
    var nodes, map;
    nodes = _.uniq(_.pluck(data, vname)).map(function (d) {
      return {name: d, value: 1};
    });

    map = d3.layout.treemap().size(size).ratio(1/1);
    map.nodes({children: nodes});

    return nodes;
  };
  var force = d3.layout.force();

  var updateView = function (size, varname) {
    var centers = getCenters(varname, size);
    force.on('tick', tickFactory(centers, varname));
    force.start();
    // if (prerender) {
    //   Timer.clear(prerender);
    // }
    // prerender = tickFactory(centers, varname);
    // Timer.every(prerender);
    labels(centers);
  }

  var tickFactory = function (centers, varname) {
    var duration = 8000, foci = {}; //alpha = 0;
    var start = Date.now();
    for (var i = 0; i < centers.length; i++) {
      foci[centers[i].name] = centers[i];
    }
    return function (e) {
      var target, actual, telapsed, quad = collide(.1);
      telapsed = Date.now() - start;
      // if (telapsed < duration) {
        // alpha = .02 //(1 - (telapsed / duration)) * .04;
        for (var d = 0, len = data.length; d < len; d++) {
          actual = data[d];
          target = foci[actual[varname]];
          actual.y += ((target.y + target.dy / 2) - actual.y) * e.alpha;
          actual.x += ((target.x + target.dx / 2) - actual.x) * e.alpha;
          actual.modifier.setTransform(
            Transform.translate(actual.x, actual.y, 1)
          );
          quad(actual);
        }
      // }
    }
  }

  var labels = function (foci) {
    d3.select("#bg-svg").selectAll(".label").remove();

    d3.select("#bg-svg").selectAll(".label").data(foci)
      .enter().append("text")
      .attr("class", "label")
      .text(function (d) { return d.name })
      .attr("transform", function (d) {
        return "translate(" + (d.x + (d.dx / 2)) + ", " + (d.y + 20) + ")";
      });
  }

  var collide = function (alpha) {
    var quadtree = d3.geom.quadtree(data);
    return function (d) {
      var r = d.radius + maxRadius + padding,
          nx1 = d.x - r,
          nx2 = d.x + r,
          ny1 = d.y - r,
          ny2 = d.y + r;
      quadtree.visit(function(quad, x1, y1, x2, y2) {
        if (quad.point && (quad.point !== d)) {
          var x = d.x - quad.point.x,
              y = d.y - quad.point.y,
              l = Math.sqrt(x * x + y * y),
              r = d.radius + quad.point.radius + padding;
          if (l < r) {
            l = (l - r) / l * alpha;
            d.x -= x *= l;
            d.y -= y *= l;
            quad.point.x += x;
            quad.point.y += y;
          }
        }
        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
      });
    };
  }
  module.exports = {
    createView: createView,
    updateView: updateView
  }
});