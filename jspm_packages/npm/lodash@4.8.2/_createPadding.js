/* */ 
var baseRepeat = require("./_baseRepeat"),
    stringSize = require("./_stringSize"),
    stringToArray = require("./_stringToArray");
var rsAstralRange = '\\ud800-\\udfff',
    rsComboMarksRange = '\\u0300-\\u036f\\ufe20-\\ufe23',
    rsComboSymbolsRange = '\\u20d0-\\u20f0',
    rsVarRange = '\\ufe0e\\ufe0f';
var rsZWJ = '\\u200d';
var reHasComplexSymbol = RegExp('[' + rsZWJ + rsAstralRange + rsComboMarksRange + rsComboSymbolsRange + rsVarRange + ']');
var nativeCeil = Math.ceil;
function createPadding(length, chars) {
  chars = chars === undefined ? ' ' : (chars + '');
  var charsLength = chars.length;
  if (charsLength < 2) {
    return charsLength ? baseRepeat(chars, length) : chars;
  }
  var result = baseRepeat(chars, nativeCeil(length / stringSize(chars)));
  return reHasComplexSymbol.test(chars) ? stringToArray(result).slice(0, length).join('') : result.slice(0, length);
}
module.exports = createPadding;
