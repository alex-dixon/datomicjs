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

function createOpts(meth, opts = {}) {
  return Object.assign({}, { method: meth }, opts);
}

class FetchConnector {
  // could use a base URL passed as url:
  constructor(config) {
    this.config = config;
  }
  // returns a Promise, use .then and .catch
  get(url, opts = {}) {
    return fetch(url, createOpts('get', opts));
  }

  // returns a Promise, use .then and .catch
  post(url, opts = {}) {
    return fetch(url, createOpts('post', opts));
  }
}

function fetchConnector(opts) {
  return new FetchConnector(opts);
}

export default class Datomex {
  // Configures Datomex for connection with your Datomic Peer.

  //     new Datomex("localhost", 8888, "db", "test")

  // * `server` - the host where Datomic is running, as a binary, example: `"localhost"`
  // * `port` - the port where Datomic is running as an integer, example: `80`
  // * `alias_db` - the name of the alias for the datomic uri, example: `"db"`
  // * `name` - the name of the default database, example: `"test"`
  // * `connector` - function which can create a HTTP REST/AJAX connection with interface:
  // - HTTP GET
  // - HTTP POST
  constructor(server, port, alias_db, name, connector) {
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
  get storages() {
    return this.connection.get(`${this.root}data/`);
  }

  // Get a list of Datomic databases from the configured alias.
  get databases() {
    return this.connection.get(`${this.root}data/${alias_db}/`);
  }

  // Get a list of Datomic databases from a passed in alias.
  databases(alias_name) {
    return this.connection.get(`${this.root}data/${alias_name}/`)
  }

  // Create a new database at the configured alias.
  create_named_database(name) {
    var params = this.encode_query({"db-name": name});
    this.connection.post(`${this.root}data/${this.alias_db}/${params}`, '');
  }

  // Create a new database at the passed in alias.
  create_database(alias_name, name) {
    if (!name) {
      return create_named_database(alias_name);
    }
    var params = this.encode_query({"db-name": name});
    this.connection.post(`${this.root}data/${alias_name}/${params}`, '');
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
  transact(data) {
    var params = this.encode_query({"tx-data": data});
    this.connection.post(`${this.db_uri}${params}`, {"Accept-Header": "application/edn"})
  }

  // Get some datoms from Datomic by index with optional arguments.
  datoms(index, opts) {
    // Enum.into(opts) ??
    var params = this.encode_query({index: index});
    this.connection.get(`${this.db_uri_}datoms?${params}`);
  }

  // Get a range of index data.
  index_range(index, attrid, opts) {
    // Enum.into(opts) ??
    var params = this.encode_query({index: index, a: attrid});
    this.connection.get(`${this.db_uri_}datoms?${params}`);
  }


  entity(eid, opts) {
    // Enum.into(opts)
    var params = this.encode_query({e: eid})
    this.connection.get(`${this.db_uri_}entity?${params}`);
  }

  _q_params(params, opts) {
    var args = opts.args || "[{:db/alias \"`${db_alias}`\"}]";
    // if (is_map(opts))
      // Enum.into(opts) ??
    return this.encode_query({q: query, args: args});
  }

  // Query datomic.
      // Datomex.q(~s([:find ?m :where [?m :movie/title "trainspotting"]]))
  q(query, opts) {
    var params = this._q_params(params, opts);
    this.connection.get(`${this.root}api/query?${params}`);
  }

  // Helper functions
  get_config(elem) {
    return this.config[elem];
  }

  get root() {
    return `http://${this.server}:${this.port}/`;
  }

  get db_alias() {
    return `${this.alias_db}/${this.name}`;
  }

  get db_uri() {
    return `${this.root}data/${db_alias}/`;
  }

  get db_uri_() {
    return `${this.db_uri}-/`;
  }

  get server() {
    return get_config('server');
  }

  get port() {
    get_config('port');
  }

  get alias_db() {
    return get_config('alias_db');
  }

  get name() {
    return get_config('name');
  }
}