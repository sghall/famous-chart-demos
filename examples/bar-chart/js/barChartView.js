define(function(require, exports, module) {
    var View = require('famous/core/View');
    var Surface = require('famous/core/Surface');
    var Transform = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');

    function ChartView() {
        View.apply(this, arguments);
    }

    ChartView.prototype = Object.create(View.prototype);
    ChartView.prototype.constructor = ChartView;

    ChartView.DEFAULT_OPTIONS = {};

    module.exports = ChartView;
});