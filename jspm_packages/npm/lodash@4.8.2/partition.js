/* */ 
var createAggregator = require("./_createAggregator");
var partition = createAggregator(function(result, value, key) {
  result[key ? 0 : 1].push(value);
}, function() {
  return [[], []];
});
module.exports = partition;
