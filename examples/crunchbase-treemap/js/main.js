define(function(require, exports, module) {
  'use strict';
  var d3            = require('d3/d3');
  var Engine        = require('famous/core/Engine');
  var Surface       = require('famous/core/Surface');
  var Transform     = require('famous/core/Transform');
  var Scrollview    = require('famous/views/Scrollview');
  var StateModifier = require('famous/modifiers/StateModifier');
  var ViewSequence  = require('famous/core/ViewSequence');
  var treeMapView   = require('treeMapView');

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

  var viewSize = [1000, 500];

  var centerModifier = new StateModifier({
    size: viewSize,
    origin: [0.5, 0.5],
    align: [0.5, 0.5]
  });

  mainContext.add(centerModifier).add(scrollview);

  d3.csv('data/crunchbase.csv', function (err, data) {

    var regions = _.unique(_.pluck(data, 'Region'));

    regions.forEach(function (r) {
      // console.log(r);
      var regionData = data.filter(function (d) {
        return d.Region === r;
      });
      // console.log(regionData);
      var view = treeMapView(viewSize, ['Market', 'Funding'], regionData, r);
      chartViews.push(view);
    });

    // for (var i = 0; i < 30; i++) {
    //     var view = treeMapView(viewSize, ['make'], data.slice(0));
    //     chartViews.push(view);
    // }

    scrollview.outputFrom(function(offset) {
        return Transform.moveThen([0, -50, 350], Transform.rotateX(-0.004 * offset));
    });
  });
});