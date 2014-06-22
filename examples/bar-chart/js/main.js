define(function(require, exports, module) {
    'use strict';
    var d3              = require('d3/d3');
    var Engine          = require('famous/core/Engine');
    var Modifier        = require('famous/core/Modifier');
    var Transform       = require('famous/core/Transform');
    var Surface         = require('famous/core/Surface');
    var barChart        = require('barChart')

    var el = document.getElementById('chart-div');
    var mainContext = Engine.createContext(el);

    d3.csv('data/letters.csv', function (err, data) {

      barChart(500, 800, 'letter', 'frequency', data, mainContext);
      // BubbleChart(500, 800, 'comb', 'frequency', data['Fuel Economy'], mainContext);
      // BubbleHierarchy(500, 800, 'comb', ['make'], data['Fuel Economy'], mainContext);

    });
});