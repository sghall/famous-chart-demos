define(function(require, exports, module) {
  'use strict';
  var d3     = require('d3/d3');
  var Engine = require('famous/core/Engine');
  var Bubble = require('bubbleClusters');

  var el = document.getElementById("charts");
  var mainCntxt = Engine.createContext(el);

  d3.csv('data/fuel.csv', function (error, data) {
    var size = [1000, 500];
    var view = Bubble.createView(size, data);
    mainCntxt.add(view);
    Bubble.updateView(size, 'make');
  });
});

    // draw('make');

    // d3.selectAll('button').on('click', function() {
    //   draw(this.id);
    // });