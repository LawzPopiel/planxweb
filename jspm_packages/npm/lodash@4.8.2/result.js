/* */ 
var baseCastPath = require("./_baseCastPath"),
    isFunction = require("./isFunction"),
    isKey = require("./_isKey");
function result(object, path, defaultValue) {
  path = isKey(path, object) ? [path] : baseCastPath(path);
  var index = -1,
      length = path.length;
  if (!length) {
    object = undefined;
    length = 1;
  }
  while (++index < length) {
    var value = object == null ? undefined : object[path[index]];
    if (value === undefined) {
      index = length;
      value = defaultValue;
    }
    object = isFunction(value) ? value.call(object) : value;
  }
  return object;
}
module.exports = result;
