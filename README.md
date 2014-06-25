famous-chart-demos
==================

Start your local server from the root of the repo in order to get all the links correct for the examples.

You really only need to look at the following examples.  The others are for demonstrating alternative ways of the doing the physics based example.

Working examples using famo.us rendering.  All the relevent js for each example is inside of the "js" folder for each example.  In general, there is a main.js file that creates a scroll view with a series of chart view e.g barChartView.js in the bar-chart example folder.

In the "examples" directory:

1. bar-chart: basic bar chart with tool-tips - creates a scrollview with 30 charts (all same data for demo).

2. bubble-chart:  creates a scroll view with a series of basic bubble charts using circle packing with size and color representing dimensions in the data.

3. bubble-hierarchy:  similar to the bubble chart, but can represent nested hierarchies of information a represent them graphically (again this is using circle packing, but could also use a tree-map (rectangles) layout which would be more space efficient).

4. bubble-quadtree: this creates a single chart using famo.us surfaces that attempts to approximate this example (http://projects.delimited.io/experiments/force-bubbles/).  It does not use the famo.us physics engine.

The other folders in "examples". Again, these are there for reference, the above example are my most complete examples of each chart type.

1. bubble-clusters:  this is an svg example that approximates the demo ar http://projects.delimited.io/experiments/force-bubbles/.  There is no famo.us rendering happening here.  It's just ther for reference.

2. bubble-physics:  this is an example that uses the famo.us physics engine to do the multi-foci demo at http://projects.delimited.io/experiments/force-bubbles/  The example works but I wasn't able to get the bubbles to eventually settle and remain stable.  The bubble-quadtree example was created as a best attempt at creating the effect.


