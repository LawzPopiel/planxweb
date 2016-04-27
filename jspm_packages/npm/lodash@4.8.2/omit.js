/* */ 
var arrayMap = require("./_arrayMap"),
    baseCastKey = require("./_baseCastKey"),
    baseDifference = require("./_baseDifference"),
    baseFlatten = require("./_baseFlatten"),
    basePick = require("./_basePick"),
    getAllKeysIn = require("./_getAllKeysIn"),
    rest = require("./rest");
var omit = rest(function(object, props) {
  if (object == null) {
    return {};
  }
  props = arrayMap(baseFlatten(props, 1), baseCastKey);
  return basePick(object, baseDifference(getAllKeysIn(object), props));
});
module.exports = omit;
