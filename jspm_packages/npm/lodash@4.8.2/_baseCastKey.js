/* */ 
var isSymbol = require("./isSymbol");
function baseCastKey(key) {
  return (typeof key == 'string' || isSymbol(key)) ? key : (key + '');
}
module.exports = baseCastKey;
