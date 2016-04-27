/* */ 
var arrayMap = require("./_arrayMap"),
    baseCastKey = require("./_baseCastKey"),
    copyArray = require("./_copyArray"),
    isArray = require("./isArray"),
    isSymbol = require("./isSymbol"),
    stringToPath = require("./_stringToPath");
function toPath(value) {
  if (isArray(value)) {
    return arrayMap(value, baseCastKey);
  }
  return isSymbol(value) ? [value] : copyArray(stringToPath(value));
}
module.exports = toPath;
