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
  var Vector         = require('famous/math/Vector');
  var d3             = require('d3/d3');

  var el = document.getElementById("charts");
  var mainContext = Engine.createContext();
  mainContext.setPerspective(500);
  window.PE = new PhysicsEngine();
  var collision = new Collisions({restitution : .75});
  window.drag = new Drag({strength : .0005});


  d3.csv('data/fuel.csv', function (error, data) {
    window.data = data;
    var width = 1000, height = 1000;
    var fill = d3.scale.ordinal().range(['#827d92','#827354','#523536','#72856a','#2a3285','#383435'])
    var svg = d3.select("#charts").append("svg")
        .attr("width", width)
        .attr("height", height);

    for (var j = 0; j < data.length; j++) {
      data[j].radius = +data[j].comb / 2;
      data[j].x = Math.random() * 100 + 200;
      data[j].y = Math.random() * 100 + 200;
    }

    var getCenters = function (vname, w, h) {
      var nodes = _.uniq(_.pluck(data, vname)).map(function (d) {
        return {name: d, value: 1};
      });

      var map = d3.layout.treemap().size([w, h]).ratio(1/1);
      map.nodes({children: nodes});

      return nodes;
    }

    var getVectorField = function (x, y) {
      return new VectorField({
        field : VectorField.FIELDS.POINT_ATTRACTOR, 
        strength : 0.00002,
        position: new Vector(x, y, 0)
      });
    };

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

    var getCircle = function (d) {
      return new Circle({
        radius: d.radius,
        position: [d.x, d.y, 0]
      });
    };

    var targets = [];
    for (var k = 0; k < data.length; k++) {
      var d = data[k];
      var particle = getCircle(d);
      var surface  = getSurface(d);
      PE.addBody(particle);
      mainContext.add(particle).add(surface);
      targets.push(particle);
    }

    startPhysics('make');

    function startPhysics (varname) {
      var centers = getCenters(varname, 600, 600);
      var foci = {}
      for (var i = 0; i < centers.length; i++) {
        var center = foci[centers[i].name]= centers[i];
        var x = center.dx / 2 + center.x;
        var y = center.dy / 2 + center.y;
        center.gravity = getVectorField(x, y);
      }
      console.log(foci);
      for (var d = 0, len = targets.length; d < len; d++) {
        var gravity = foci[data[d][varname]].gravity;
        PE.attach([collision], targets, targets[d]);
        PE.attach([gravity, drag], targets[d]);
      }

      setTimeout(function () {
        var agents = PE._agents;
        for (var a in agents) {
          if (agents[a].agent instanceof Drag) {
            console.log(+a, agents[a])
            PE.detach(+a);
          }
        }
      }, 10000);


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