define([
  'underscore'
],
function(_) {

  var Loader = function(type) {
    this.type = type || '';
  };

  _.extend(Loader.prototype, {
    get: function() {
      var fileNames = Array.prototype.slice.call(arguments);
      var dfd = $.Deferred();
      var path = this.type ? this.type + "/" : this.type;

      fileNames = _.map(fileNames, function(fileName) {
        return path + fileName;
      });

      require(fileNames, function() {
        dfd.resolve.apply(dfd, arguments);
      }, function(e) {
        dfd.reject.apply(dfd, arguments);
        throw e;
      });

      return dfd.promise();
    }
  });

  return Loader;

});