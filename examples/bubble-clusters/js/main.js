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

    var width = 1000, height = 1000;
    var fill = d3.scale.ordinal().range(['#827d92','#827354','#523536','#72856a','#2a3285','#383435'])
    var svg = d3.select("#charts").append("svg")
        .attr("width", width)
        .attr("height", height);

    _.each(data, function (elem) {
      elem.radius = +elem.comb / 2;
      elem.x = _.random(0, width);
      elem.y = _.random(0, height);
    })

    var padding = 4;
    var maxRadius = d3.max(_.pluck(data, 'radius'));


    function getCenters(vname, w, h) {
      var nodes = [], c =[], result = {};
      var v = _.uniq(_.pluck(data, vname));
      var l = d3.layout.pack().size([w, h]);
      _.each(v, function (k, i) {
        c.push({name: k, value: 1}); 
      });
      nodes = l.nodes({children: c})[0].children;

      for (var i = 0; i < nodes.length; i++) {
        result[nodes[i].name] = nodes[i];
      }
      return result;
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

    // $( ".btn" ).click(function() {
    //   draw(this.id);
    // });

    function draw (varname) {
      var foci = getCenters(varname, 1000, 1000);
      force.on("tick", tick(foci, varname, .85));
      labels(foci)
      force.start();
    }

    function tick (foci, varname, k) {
      return function (e) {
        data.forEach(function(o, i) {
          var f = foci[o[varname]];
          o.y += (f.y - o.y) * k * e.alpha;
          o.x += (f.x - o.x) * k * e.alpha;
        });
        nodes
          .each(collide(.1))
          .attr("cx", function (d) { return d.x; })
          .attr("cy", function (d) { return d.y; });
      }
    }

    function labels (foci) {
      svg.selectAll(".label").remove();

      svg.selectAll(".label")
      .data(_.toArray(foci)).enter().append("text")
      .attr("class", "label")
      .text(function (d) { return d.name })
      .attr("transform", function (d) {
        return "translate(" + (d.x - ((d.name.length)*3)) + ", " + (d.y - d.r) + ")";
      });
    }

    // function removePopovers () {
    //   $('.popover').each(function() {
    //     $(this).remove();
    //   }); 
    // }

    // function showPopover (d) {
    //   $(this).popover({
    //     placement: 'auto top',
    //     container: 'body',
    //     trigger: 'manual',
    //     html : true,
    //     content: function() { 
    //       return "Make: " + d.make + "<br/>Model: " + d.model + "<br/>Drive: " + d.drive +
    //              "<br/>Trans: " + d.trans + "<br/>MPG: " + d.comb; }
    //   });
    //   $(this).popover('show')
    // }

    function collide(alpha) {
      var quadtree = d3.geom.quadtree(data);
      return function(d) {
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



