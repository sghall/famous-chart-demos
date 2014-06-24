define(function(require, exports, module) {
  'use strict';
  var Engine           = require('famous/core/Engine');
  var Surface          = require('famous/core/Surface');
  var Transform        = require('famous/core/Transform');
  var Scrollview       = require('famous/views/Scrollview');
  var StateModifier    = require('famous/modifiers/StateModifier');
  var ViewSequence     = require('famous/core/ViewSequence');
  var d3               = require('d3/d3');

  var el = document.getElementById("charts");
  var mainContext = Engine.createContext(el);
  mainContext.setPerspective(500);

  d3.csv('data/fuel.csv', function (error, data) {
    window.data = data;
    var width = 1000, height = 1000;
    var fill = d3.scale.ordinal().range(['#827d92','#827354','#523536','#72856a','#2a3285','#383435'])
    var svg = d3.select("#charts").append("svg")
        .attr("width", width)
        .attr("height", height);

    for (var j = 0; j < data.length; j++) {
      data[j].radius = +data[j].comb / 2;
      data[j].x = Math.random() * width;
      data[j].y = Math.random() * height;
    }

    var padding = 4;
    var maxRadius = d3.max(_.pluck(data, 'radius'));

    function getCenters(vname, w, h) {
      var nodes = _.uniq(_.pluck(data, vname)).map(function (d) {
        return {name: d, value: 1};
      });

      var pack = d3.layout.pack().size([w, h]);
      pack.nodes({children: nodes});

      return nodes;
    }

    var nodes = svg.selectAll("circle")
      .data(data);

    nodes.enter().append("circle")
      .attr("class", "node")
      .attr("cx", function (d) { return d.x; })
      .attr("cy", function (d) { return d.y; })
      .attr("r", 2)
      .style("fill", function (d) { return fill(d.make); })

    nodes.transition().duration(1000)
      .attr("r", function (d) { return d.radius; })

    var force = d3.layout.force()
      .charge(0)
      .gravity(0)
      .size([width, height])

    draw('make');

    function draw (varname) {
      var centers = getCenters(varname, 600, 600);
      force.on("tick", tick(centers, varname, .85));
      labels(centers)
      force.start();
    }

    function tick (centers, varname, k) {
      var foci = {}
      for (var i = 0; i < centers.length; i++) {
        foci[centers[i].name] = centers[i];
      }
      return function (e) {
        for (var d = 0, len = data.length; d < len; d++) {
          var target = foci[data[d][varname]];
          data[d].y += (target.y - data[d].y) * k * e.alpha;
          data[d].x += (target.x - data[d].x) * k * e.alpha;
        }
        nodes.each(collide(.1))
          .attr("cx", function (d) { return d.x; })
          .attr("cy", function (d) { return d.y; });
      }
    }

    function labels (foci) {
      svg.selectAll(".label").remove();

      svg.selectAll(".label")
      .data(foci).enter()
        .append("text")
          .attr("class", "label")
          .text(function (d) { return d.name })
          .attr("transform", function (d) {
            return "translate(" + (d.x - ((d.name.length)*3)) + ", " + (d.y - d.r) + ")";
          });
    }

    function collide(alpha) {
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
  });
});
