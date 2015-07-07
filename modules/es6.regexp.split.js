// @@split logic
require('./$.fix-re-wks')('split', function(SPLIT, $split){
  return [
    // 21.1.3.17 String.prototype.split(separator, limit)
    function split(separator, limit){
      var str = String(this)
        , fn  = separator == undefined ? undefined : separator[SPLIT];
      return fn !== undefined ? fn.call(separator, str, limit) : $split.call(str, separator, limit);
    },
    // 21.2.5.11 RegExp.prototype[@@split](string, limit)
    function(string, limit){
      return $split.call(string, this, limit);
    }
  ];
});