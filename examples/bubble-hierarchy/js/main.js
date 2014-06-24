define(function(require, exports, module) {
  'use strict';
  var d3                   = require('d3/d3');
  var Engine               = require('famous/core/Engine');
  var Surface              = require('famous/core/Surface');
  var Transform            = require('famous/core/Transform');
  var Scrollview           = require('famous/views/Scrollview');
  var StateModifier        = require('famous/modifiers/StateModifier');
  var ViewSequence         = require('famous/core/ViewSequence');
  var bubbleHierarchyView  = require('bubbleHierarchyView');

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

  var viewSize = [600, 400];

  var centerModifier = new StateModifier({
      size: viewSize,
      origin: [0.5, 0.5],
      align: [0.5, 0.5]
  });

  mainContext.add(centerModifier).add(scrollview);

  d3.csv('data/fuel.csv', function (err, data) {

    for (var i = 0; i < 30; i++) {
        var view = bubbleHierarchyView(viewSize, ['make'], data.slice(0));
        chartViews.push(view);
    }

    scrollview.outputFrom(function(offset) {
        return Transform.moveThen([0, -50, 350], Transform.rotateX(-0.004 * offset));
    });
  });
});