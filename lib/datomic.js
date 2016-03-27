var request = require('solicit')

var edn = require('jsedn');
var merge = require('merge')

function Datomic(server, port, alias, name) {
  // Allow options Object form:
  //  new Datomic({host: 'localhost', port: 8888, alias: 'db', name: 'imdb'});
  if (typeof server != string) {
    Datomic(server.server || 'localhost', server.port || 8888, server.alias, server.name);
  }

  this.root = 'http://' + server + ':' + port + '/'
  this.db_alias = alias + '/' + name
  this.db_uri = this.root + 'data/' + this.db_alias + '/'
  this.db_uri_ = this.db_uri + '-/'
  this.ready = request
    .post(this.root + 'data/' + alias + '/')
    .accept('application/edn')
    .send({'db-name': name})
    .type('form')
    .then()
}

Datomic.prototype.transact = function(data) {
  // convert transaction data to a String to send over HTTP connection
  if (typeof data != 'string') {
    data = edn.encode(data);
  }
  return request.post(this.db_uri)
    .accept('application/edn')
    .send({'tx-data': data})
    .type('form')
}

Datomic.prototype.entity = function(id, opts) {
  return get(this.db_uri_ + 'entity').query(merge({e: id}, opts))
}

Datomic.prototype.q = function(query, opts) {
  return get(this.root + 'api/query').query(merge({
    args: '[{:db/alias "' + this.db_alias + '"}]',
    q: query
  }, opts))
}

function get(uri) {
  return request.get(uri).accept('application/edn')
}

module.exports = Datomic
