define(function(require, exports, module) {
    'use strict';
    var Engine        = require('famous/core/Engine');
    var Surface       = require('famous/core/Surface');
    var Transform     = require('famous/core/Transform');
    var Scrollview    = require('famous/views/Scrollview');
    var StateModifier = require('famous/modifiers/StateModifier');
    var ViewSequence  = require('famous/core/ViewSequence');
    var barChartView  = require('barChartView');
    var d3            = require('d3/d3');

    var el = document.getElementById("charts");
    var mainContext = Engine.createContext(el);
    mainContext.setPerspective(500);

    var chartViews = [];
    var scrollview = new Scrollview({
        margin: 50
    });

    Engine.pipe(scrollview);

    var viewSequence = new ViewSequence({
        array: chartViews,
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

      for (var i = 0; i < 30; i++) {
          var view = barChartView(400, 800, data);
          chartViews.push(view);
      }

      scrollview.outputFrom(function(offset) {
          return Transform.moveThen([0, -50, 350], Transform.rotateX(-0.004 * offset));
      });
    });
});