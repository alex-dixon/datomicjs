var Query,
  __slice = [].slice;

Query = (function() {
  function Query() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    this.data = [':find ' + args.join(' ')];
  }

  Query.prototype["in"] = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    this.data.push(':in $ ' + args.join(' '));
    return this;
  };

  Query.prototype.where = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    this.data.push(':where [' + args.join(' ') + ']');
    return this;
  };

  Query.prototype.and = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    this.data.push('[' + args.join(' ') + ']');
    return this;
  };

  Query.prototype.lt = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    this.data.push('[(< ' + args.join(' ') + ')]');
    return this;
  };

  Query.prototype.toString = function() {
    return '[' + this.data.join(' ') + ']';
  };

  return Query;

})();

module.exports = function() {
  var args;
  args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
  return new Query(args);
};