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
  var mainContext = Engine.createContext(el);
  mainContext.setPerspective(500);
  window.PE = new PhysicsEngine();

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

    var getVectorField = function (x, y) {
      return new VectorField({
        field : VectorField.FIELDS.POINT_ATTRACTOR, 
        strength : 0.000002,
        position: new Vector(x, y, 0)
      });
    };


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
      force.on("tick", tickFactory(centers, varname, .85));
      labels(centers)
      force.start();
    }

    function tickFactory (centers, varname, k) {
      var foci = {}
      for (var i = 0; i < centers.length; i++) {
        var center = foci[centers[i].name]= centers[i];
        center.gravity = getVectorField(center.x, center.y);
      }
      console.log(foci);
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



    // function tickFactory (centers, varname, k) {
    //   var foci = {}
    //   for (var i = 0; i < centers.length; i++) {
    //     var center = foci[centers[i].name]= centers[i];
    //     center.gravity = getVectorField(center.x, center.y);
    //   }
    //   console.log(foci);
    //   return function (e) {
    //     for (var d = 0, len = data.length; d < len; d++) {
    //       var target = foci[data[d][varname]];
    //       data[d].y += (target.y - data[d].y) * k * e.alpha;
    //       data[d].x += (target.x - data[d].x) * k * e.alpha;
    //     }
    //     nodes.each(collide(.1))
    //       .attr("cx", function (d) { return d.x; })
    //       .attr("cy", function (d) { return d.y; });
    //   }
    // }

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

    // window.gravity = new VectorField({
    //   field : VectorField.FIELDS.POINT_ATTRACTOR, 
    //   strength : gravityStrength,
    //   position: new Vector(200, 200, 0)
    // });

    // window.gravity2 = new VectorField({
    //   field : VectorField.FIELDS.POINT_ATTRACTOR, 
    //   strength : gravityStrength,
    //   position: new Vector(400, 100, 0)
    // });

    // window.gravity3 = new VectorField({
    //   field : VectorField.FIELDS.POINT_ATTRACTOR, 
    //   strength : gravityStrength,
    //   position: new Vector(600, 300, 0)
    // });

    // var repulsion = new Repulsion({
    //     strength : repulsionStrength
    // });
    // //************************************************
    // //**  TARGETS ONE
    // //************************************************
    // var targets = [];
    // for (var i = 0; i < numTargets; i++){
    //     var surface =  new Surface({
    //         origin: [0.5, 0.5],
    //         size : [48,48],
    //         classes: ['mycircle'],
    //         properties : {
    //             borderRadius : '50%',
    //             border: '2px solid #333'
    //         }
    //     });

    //     var particle = new Circle({
    //         radius: 25,
    //         position: [300, Math.random()*20 + 300, 0]
    //     });

    //     physicsEngine.addBody(particle);
    //     mainContext.add(particle).add(surface);

    //     targets.push(particle);
    // }

    // //************************************************
    // //**  TARGETS TWO
    // //************************************************
    // var targets2 = [];
    // for (var i = 0; i < numTargets; i++){
    //     var surface =  new Surface({
    //         origin: [0.5, 0.5],
    //         size : [15,15],
    //         properties : {
    //             background : 'aliceblue',
    //             borderRadius : '50%',
    //             border: '2px solid #333'
    //         }
    //     });

    //     var particle = new Circle({
    //         radius: 9,
    //         position: [300, Math.random()*20 + 300, 0]
    //     });

    //     physicsEngine.addBody(particle);
    //     mainContext.add(particle).add(surface);

    //     targets2.push(particle);
    // }



    // //************************************************
    // //**  TARGETS THREE
    // //************************************************
    // var targets3 = [];
    // for (var i = 0; i < numTargets; i++){
    //     var surface =  new Surface({
    //         origin: [0.5, 0.5],
    //         size : [20,20],
    //         properties : {
    //             background : 'green',
    //             borderRadius : '50%',
    //             border: '2px solid #333'
    //         }
    //     });

    //     var particle = new Circle({
    //         radius: 11,
    //         position: [300, Math.random()*20 + 300, 0]
    //     });

    //     physicsEngine.addBody(particle);
    //     mainContext.add(particle).add(surface);

    //     targets3.push(particle);
    // }



    // var centerParticle = new Particle({
    //     position: [200, 200, 0]
    //     // position : [
    //     //     (1000 * Math.random()) + 300,
    //     //     (1000 * Math.random()) + 300,
    //     //     0
    //     // ]
    // });

    // var centerRepulsion = new Repulsion({
    //     strength : -1
    // });

    // var centerGravity = new VectorField({
    //   field : VectorField.FIELDS.POINT_ATTRACTOR, 
    //   strength : .002,
    //   position: new Vector(200, 200, 0)
    // });

    // var sources = [];
    // for (var i = 0; i < numTargets; i++){
    //     var surface =  new Surface({
    //         size : [50,50],
    //         properties : {
    //             background : 'blue',
    //             borderRadius : '50%'
    //         }
    //     });

    //     var particle = new Particle({
    //         position : [
    //           100 * Math.random(),
    //           100 * Math.random(),
    //           0
    //         ]
    //     });

    //     physicsEngine.addBody(particle);
    //     mainContext.add(particle).add(surface);

    //     sources.push(particle);
    // }

    // for (var i = 0; i < targets.length; i++) {
    //   targets[i].position = new Vector([Math.random()*5 + 300, Math.random()*5 + 300, 0]);
    //   physicsEngine.attach([gravity, drag], targets, targets[i]);

    //   physicsEngine.attach([collision], targets.concat(targets2).concat(targets3), targets[i]);
    //   physicsEngine.attach([collision], targets.concat(targets2).concat(targets3), targets2[i]);
    //   physicsEngine.attach([collision], targets.concat(targets2).concat(targets3), targets3[i]);

    //   targets2[i].position = new Vector([Math.random()*5 + 300, Math.random()*5 + 300, 0]);
    //   physicsEngine.attach([gravity2, drag], targets2, targets2[i]);

    //   targets3[i].position = new Vector([Math.random()*5 + 300, Math.random()*5 + 300, 0]);
    //   physicsEngine.attach([gravity3, drag], targets3, targets3[i]);
    // }

    // physicsEngine.attach([drag], targets, centerParticle);

    // setTimeout(function () {
    //   physicsEngine.sleep();
    //   console.log("Sleeping", physicsEngine.isSleeping())
    // },4000)


