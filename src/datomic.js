var request = require('solicit')
var edn = require('jsedn');
var merge = require('merge')

export default class Datomic {
  constructor(server, port, alias, name) {
    // Allow options Object form:
    //  new Datomic({host: 'localhost', port: 8888, alias: 'db', name: 'imdb'});
    if (typeof server != string) {
      Datomic(server.server || 'localhost', server.port || 8888, server.alias, server.name);
    }

    this.root = `http://${server}:${port}/`;
    this.db_alias = `${alias}/${name}`;
    this.db_uri = `${this.root}data/${this.db_alias}/`;
    this.db_uri_ = `${this.db_uri}-/`;
    this.ready = request
      .post(`${this.root}data/${alias}/`)
      .accept('application/edn')
      .send({'db-name': name})
      .type('form')
      .then()
  }

  transact(data) {
    // convert transaction data to a String to send over HTTP connection
    if (typeof data != 'string') {
      data = edn.encode(data);
    }
    return request.post(this.db_uri)
      .accept('application/edn')
      .send({'tx-data': data})
      .type('form')
  }

  entity(id, opts) {
    return this.get(this.db_uri_ + 'entity').query(merge({e: id}, opts))
  }

  q(query, opts) {
    return this.get(`${this.root}api/query`).query(merge({
      args: `[{:db/alias '${this.db_alias}'}]`,
      q: query
    }, opts))
  }

  datoms(index, opts) {
    return this.get(`${this.db_uri_}/datoms`).query({index: index});
  }

  // Get a range of index data.
  index_range(index, attrid, opts) {
    return this.get(`${this.db_uri_}/datoms`).query({index: index, a: attrid});
  }


  storages() {
    return this.get(`${this.db_uri}/data/`);
  }

  // Get a list of Datomic databases from alias.
  databases(aliasName) {
    aliasName = aliasName || this.db_alias;
    return this.get(`${this.db_uri}/data/${aliasName}/`);
  }


  createDb(name, aliasName) {
    aliasName = aliasName || this.db_alias;

    return this.post(`${this.db_uri}/data/${aliasName}`)
      .accept('application/edn')
      .send({'db-name': name})
      .type('form')
  }

  get(uri) {
    return this.request.get(uri).accept('application/edn');
  }

  post(uri, data) {
    return this.request.post(uri).send(data).accept('application/edn');
  }
}

Datomic.create = function(obj) {
  new Datomic(obj.server, obj.port, obj.alias, obj.name);
}