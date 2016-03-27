'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var request = require('solicit');
var edn = require('jsedn');
var merge = require('merge');

var Datomic = function () {
  function Datomic(server, port, alias, name) {
    _classCallCheck(this, Datomic);

    // Allow options Object form:
    //  new Datomic({host: 'localhost', port: 8888, alias: 'db', name: 'imdb'});
    if ((typeof server === 'undefined' ? 'undefined' : _typeof(server)) != string) {
      Datomic(server.server || 'localhost', server.port || 8888, server.alias, server.name);
    }

    this.root = 'http://' + server + ':' + port + '/';
    this.db_alias = alias + '/' + name;
    this.db_uri = this.root + 'data/' + this.db_alias + '/';
    this.db_uri_ = this.db_uri + '-/';
    this.ready = request.post(this.root + 'data/' + alias + '/').accept('application/edn').send({ 'db-name': name }).type('form').then();
  }

  _createClass(Datomic, [{
    key: 'transact',
    value: function transact(data) {
      // convert transaction data to a String to send over HTTP connection
      if (typeof data != 'string') {
        data = edn.encode(data);
      }
      return request.post(this.db_uri).accept('application/edn').send({ 'tx-data': data }).type('form');
    }
  }, {
    key: 'entity',
    value: function entity(id, opts) {
      return this.get(this.db_uri_ + 'entity').query(merge({ e: id }, opts));
    }
  }, {
    key: 'q',
    value: function q(query, opts) {
      return this.get(this.root + 'api/query').query(merge({
        args: '[{:db/alias \'' + this.db_alias + '\'}]',
        q: query
      }, opts));
    }
  }, {
    key: 'datoms',
    value: function datoms(index, opts) {
      return this.get(this.db_uri_ + '/datoms').query({ index: index });
    }

    // Get a range of index data.

  }, {
    key: 'index_range',
    value: function index_range(index, attrid, opts) {
      return this.get(this.db_uri_ + '/datoms').query({ index: index, a: attrid });
    }
  }, {
    key: 'storages',
    value: function storages() {
      return this.get(this.db_uri + '/data/');
    }

    // Get a list of Datomic databases from alias.

  }, {
    key: 'databases',
    value: function databases(aliasName) {
      aliasName = aliasName || this.db_alias;
      return this.get(this.db_uri + '/data/' + aliasName + '/');
    }
  }, {
    key: 'createDb',
    value: function createDb(name, aliasName) {
      aliasName = aliasName || this.db_alias;

      return this.post(this.db_uri + '/data/' + aliasName).accept('application/edn').send({ 'db-name': name }).type('form');
    }
  }, {
    key: 'get',
    value: function get(uri) {
      return this.request.get(uri).accept('application/edn');
    }
  }, {
    key: 'post',
    value: function post(uri, data) {
      return this.request.post(uri).send(data).accept('application/edn');
    }
  }]);

  return Datomic;
}();

exports.default = Datomic;


Datomic.create = function (obj) {
  new Datomic(obj.server, obj.port, obj.alias, obj.name);
};