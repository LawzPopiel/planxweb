/* */ 
var Hash = require("./_Hash"),
    Map = require("./_Map");
function mapClear() {
  this.__data__ = {
    'hash': new Hash,
    'map': Map ? new Map : [],
    'string': new Hash
  };
}
module.exports = mapClear;
