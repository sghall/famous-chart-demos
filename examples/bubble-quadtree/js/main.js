define(function(require, exports, module) {
  'use strict';
  var Engine         = require('famous/core/Engine');
  var Surface        = require('famous/core/Surface');
  var RenderNode     = require('famous/core/RenderNode');
  var Modifier       = require('famous/core/Modifier');
  var Transform      = require('famous/core/Transform');
  var Circle         = require('famous/physics/bodies/Circle')
  var PhysicsEngine  = require('famous/physics/PhysicsEngine');
  var Random         = require('famous/math/Random');
  var VectorField    = require('famous/physics/forces/VectorField');
  var Drag           = require('famous/physics/forces/Drag');
  var Collisions     = require('famous/physics/constraints/Collision');
  var Walls          = require('famous/physics/constraints/Walls');
  var StateModifier  = require('famous/modifiers/StateModifier');
  var Easing         = require('famous/transitions/Easing')
  var Vector         = require('famous/math/Vector');
  var d3             = require('d3/d3');

  var el = document.getElementById("charts");
  var mainContext = Engine.createContext(el);
  mainContext.setPerspective(500);

  d3.csv('data/fuel.csv', function (error, data) {
    window.data = data;
    var width = 1000, height = 1000;
    var force = d3.layout.force()
      .charge(0)
      .gravity(0)
      .size([width, height])

    var fill = d3.scale.ordinal().range(['#827d92','#827354','#523536','#72856a','#2a3285','#383435'])

    var getSurface = function (d) {
      return new Surface({
        origin: [0.5, 0.5],
        size : [d.radius * 2, d.radius * 2],
        properties : {
            background : fill(d.make),
            borderRadius : '50%',
            border: '2px solid #333'
        }
      });
    };

    var getSurfaceModifier = function (d, i) {
      // console.log(i, d)
      var modifier = new StateModifier({
        align: [0, 0],
        origin: [0.5, 0.5]
      });

      modifier.setTransform(
        Transform.translate(d.x, d.y, 1),
        { duration : 0, curve: Easing.inOutElastic }
      );

      return modifier;
    };

    for (var j = 0; j < data.length; j++) {
      data[j].radius = +data[j].comb / 2;
      data[j].x = Math.random() * 100 + 200;
      data[j].y = Math.random() * 100 + 200;
      data[j].surface = getSurface(data[j]);
      data[j].modifier = getSurfaceModifier(data[j], j);
      mainContext.add(data[j].modifier).add(data[j].surface);
    }

    var padding = 2;
    var maxRadius = d3.max(_.pluck(data, 'radius'));


    console.log(data);

    var getCenters = function (vname, w, h) {
      var nodes = _.uniq(_.pluck(data, vname)).map(function (d) {
        return {name: d, value: 1};
      });

      var map = d3.layout.treemap().size([w, h]).ratio(1/1);
      map.nodes({children: nodes});

      return nodes;
    }

    draw('make');

    function draw (varname) {
      var centers = getCenters(varname, 600, 600);
      force.on("tick", tick(centers, varname, .85));
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
          collide(0.5)(data[d]);
          data[d].modifier.setTransform(
            Transform.translate(data[d].x, data[d].y, 10),
            { duration : 10, curve: 'linear' }
          )
        }
      }
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