/* */ 
var test = require("tape");
var walkdir = require("../walkdir");
test('async events', function(t) {
  var paths = [],
      files = [],
      dirs = [];
  var emitter = walkdir(__dirname + '/dir/foo', function(path) {
    paths.push(path.replace(__dirname + '/', ''));
  }).ignore(__dirname + '/dir/foo/a');
  emitter.on('end', function() {
    t.equals(paths.sort().join('|'), 'dir/foo/a|dir/foo/x', 'should have ignored under a');
    t.end();
  });
});
