define(function(require, exports, module) {
    'use strict';
    var Engine        = require('famous/core/Engine');
    var Surface       = require('famous/core/Surface');
    var Transform     = require('famous/core/Transform');
    var Scrollview    = require('famous/views/Scrollview');
    var StateModifier = require('famous/modifiers/StateModifier');
    var ViewSequence  = require('famous/core/ViewSequence');
    var barChart      = require('barChart');
    var d3            = require('d3/d3');

    var el = document.getElementById('chart-div');
    var mainContext = Engine.createContext(el);    
    mainContext.setPerspective(3000);
    var surfaces = [];
    var scrollview = new Scrollview({
        margin: 10
    });

    Engine.pipe(scrollview);

    var viewSequence = new ViewSequence({
        array: surfaces,
        loop: true
    });
    scrollview.sequenceFrom(viewSequence);

    var size = [800, 400];

    var centerModifier = new StateModifier({
        size: size,
        origin: [0.5, 0.5],
        align: [0.5, 0.5]
    });

    mainContext.add(centerModifier).add(scrollview);

    d3.csv('data/letters.csv', function (err, data) {

      for (var i = 0; i < 20; i++) {
          var surface = barChart(400, 800, 'letter', 'frequency', data, mainContext);

          surfaces.push(surface);
      }

      scrollview.outputFrom(function(offset) {
          return Transform.moveThen([0, -50, 350], Transform.rotateX(-0.004 * offset));
      });
    });






    // var d3               = require('d3/d3');
    // var Engine           = require('famous/core/Engine');
    // var Modifier         = require('famous/core/Modifier');
    // var Transform        = require('famous/core/Transform');
    // var Surface          = require('famous/core/Surface');
    // var barChart         = require('barChart');
    // var barView          = require('barChartView');
    // var SequentialLayout = require("famous/views/SequentialLayout");

    // var el = document.getElementById('chart-div');
    // var mainContext = Engine.createContext(el);

    // var sequentialLayout = new SequentialLayout();

    // var renderables = [];

    // sequentialLayout.sequenceFrom(renderables);

    // d3.csv('data/letters.csv', function (err, data) {
    //   console.log("yo")
    //   var view = new barView({
    //     size: [800, 500]
    //   });

    //   var chart1 = barChart(100, 800, 'letter', 'frequency', data, mainContext);
    //   var chart2 = barChart(100, 800, 'letter', 'frequency', data, mainContext);

    //   chart1.getSize = function () {
    //     return [800, 100]
    //   }

    //   chart2.getSize = function () {
    //     return [800, 100]
    //   }


    //   console.log(chart2.getSize());
    //   renderables.push(chart1, chart2);
    //   // BubbleChart(500, 800, 'comb', 'frequency', data['Fuel Economy'], mainContext);
    //   // BubbleHierarchy(500, 800, 'comb', ['make'], data['Fuel Economy'], mainContext);

    // });
    // mainContext.add(sequentialLayout);
});