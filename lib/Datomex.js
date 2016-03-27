'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Datomex is a low level driver for the Datomic database.

// Datomex utilizes Datomic's REST API, so in order to use Datomex,
// a Datomic peer to serve as an HTTP server must be running. The peer can be
// executed with the following:

//     bin/rest -p port [-o origins]? [alias uri]+

// For example, to run Datomex's tests, start Datomic with:

//     bin/rest -p 8888 -o /'*'/  db datomic:mem://

// More information about the REST API is available at http://docs.datomic.com/rest.html .

// Datomex must be initialized by calling `start_link` and passing in the `server`,
// `port`, `alias` and `name`.  For example:

//     Datomex.start_link "localhost", 8888, "db", "test"

// * `server` - the host where Datomic is running, as a binary, example: `"localhost"`
// * `port` - the port where Datomic is running as an integer, example: `80`
// * `alias_db` - the name of the alias for the datomic uri, example: `"db"`
// * `name` - the name of the default database, example: `"test"`

function createOpts(meth) {
  var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  return Object.assign({}, { method: meth }, opts);
}

var FetchConnector = function () {
  // could use a base URL passed as url:
  function FetchConnector(config) {
    _classCallCheck(this, FetchConnector);

    this.config = config;
  }
  // returns a Promise, use .then and .catch


  _createClass(FetchConnector, [{
    key: 'get',
    value: function get(url) {
      var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      return fetch(url, createOpts('get', opts));
    }

    // returns a Promise, use .then and .catch

  }, {
    key: 'post',
    value: function post(url) {
      var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      return fetch(url, createOpts('post', opts));
    }
  }]);

  return FetchConnector;
}();

function fetchConnector(opts) {
  return new FetchConnector(opts);
}

var Datomex = function () {
  // Configures Datomex for connection with your Datomic Peer.

  //     new Datomex("localhost", 8888, "db", "test")

  // * `server` - the host where Datomic is running, as a binary, example: `"localhost"`
  // * `port` - the port where Datomic is running as an integer, example: `80`
  // * `alias_db` - the name of the alias for the datomic uri, example: `"db"`
  // * `name` - the name of the default database, example: `"test"`
  // * `connector` - function which can create a HTTP REST/AJAX connection with interface:
  // - HTTP GET
  // - HTTP POST

  function Datomex(server, port, alias_db, name, connector) {
    _classCallCheck(this, Datomex);

    this.config = {
      server: server || 'localhost',
      port: port || 8888,
      alias_db: alias_db,
      name: name
    };
    connector = connector || fetchConnector;

    this.connection = connector(config);
  }

  // Get a list of Datomic storages

  //   iex> Datomex.storages
  //   {:ok,
  //       %this.connection.Response{body: "[\"db\"]",
  //        headers: %{"Content-Length" => "6",
  //          "Content-Type" => "application/edn;charset=UTF-8",
  //          "Date" => "Mon, 24 Nov 2014 10:14:24 GMT",
  //          "Server" => "Jetty(8.1.11.v20130520)", "Vary" => "Accept"},
  //        status_code: 200}}


  _createClass(Datomex, [{
    key: 'databases',


    // Get a list of Datomic databases from a passed in alias.
    value: function databases(alias_name) {
      return this.connection.get(this.root + 'data/' + alias_name + '/');
    }

    // Create a new database at the configured alias.

  }, {
    key: 'create_named_database',
    value: function create_named_database(name) {
      var params = this.encode_query({ "db-name": name });
      this.connection.post(this.root + 'data/' + this.alias_db + '/' + params, '');
    }

    // Create a new database at the passed in alias.

  }, {
    key: 'create_database',
    value: function create_database(alias_name, name) {
      if (!name) {
        return create_named_database(alias_name);
      }
      var params = this.encode_query({ "db-name": name });
      this.connection.post(this.root + 'data/' + alias_name + '/' + params, '');
    }

    // Send a transaction to Datomic.
    /*
        movies = ~s([
          {:db/id #db/id[:db.part/db]
          :db/ident :movie/title
          :db/valueType :db.type/string
          :db/cardinality :db.cardinality/one
          :db/doc "movie's title"
          :db.install/_attribute :db.part/db}
          {:db/id #db/id[:db.part/db]
          :db/ident :movie/rating
          :db/valueType :db.type/double
          :db/cardinality :db.cardinality/one
          :db/doc "movie's rating"
          :db.install/_attribute :db.part/db}
        ])
        Datomex.transact movies
    */

  }, {
    key: 'transact',
    value: function transact(data) {
      var params = this.encode_query({ "tx-data": data });
      this.connection.post('' + this.db_uri + params, { "Accept-Header": "application/edn" });
    }

    // Get some datoms from Datomic by index with optional arguments.

  }, {
    key: 'datoms',
    value: function datoms(index, opts) {
      // Enum.into(opts) ??
      var params = this.encode_query({ index: index });
      this.connection.get(this.db_uri_ + 'datoms?' + params);
    }

    // Get a range of index data.

  }, {
    key: 'index_range',
    value: function index_range(index, attrid, opts) {
      // Enum.into(opts) ??
      var params = this.encode_query({ index: index, a: attrid });
      this.connection.get(this.db_uri_ + 'datoms?' + params);
    }
  }, {
    key: 'entity',
    value: function entity(eid, opts) {
      // Enum.into(opts)
      var params = this.encode_query({ e: eid });
      this.connection.get(this.db_uri_ + 'entity?' + params);
    }
  }, {
    key: '_q_params',
    value: function _q_params(params, opts) {
      var args = opts.args || "[{:db/alias \"`${db_alias}`\"}]";
      // if (is_map(opts))
      // Enum.into(opts) ??
      return this.encode_query({ q: query, args: args });
    }

    // Query datomic.
    // Datomex.q(~s([:find ?m :where [?m :movie/title "trainspotting"]]))

  }, {
    key: 'q',
    value: function q(query, opts) {
      var params = this._q_params(params, opts);
      this.connection.get(this.root + 'api/query?' + params);
    }

    // Helper functions

  }, {
    key: 'get_config',
    value: function get_config(elem) {
      return this.config[elem];
    }
  }, {
    key: 'storages',
    get: function get() {
      return this.connection.get(this.root + 'data/');
    }

    // Get a list of Datomic databases from the configured alias.

  }, {
    key: 'databases',
    get: function get() {
      return this.connection.get(this.root + 'data/' + alias_db + '/');
    }
  }, {
    key: 'root',
    get: function get() {
      return 'http://' + this.server + ':' + this.port + '/';
    }
  }, {
    key: 'db_alias',
    get: function get() {
      return this.alias_db + '/' + this.name;
    }
  }, {
    key: 'db_uri',
    get: function get() {
      return this.root + 'data/' + db_alias + '/';
    }
  }, {
    key: 'db_uri_',
    get: function get() {
      return this.db_uri + '-/';
    }
  }, {
    key: 'server',
    get: function get() {
      return get_config('server');
    }
  }, {
    key: 'port',
    get: function get() {
      get_config('port');
    }
  }, {
    key: 'alias_db',
    get: function get() {
      return get_config('alias_db');
    }
  }, {
    key: 'name',
    get: function get() {
      return get_config('name');
    }
  }]);

  return Datomex;
}();

exports.default = Datomex;