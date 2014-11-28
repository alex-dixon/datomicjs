var serialize = require('serialize-edn')
var request = require('solicit')
var parse = require('parse-edn')
var merge = require('merge')

function Datomic(server, port, alias, name) {
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
  if (typeof data != 'string') data = serialize(data)
  return request.post(this.db_uri)
    .accept('application/edn')
    .send({'tx-data': data})
    .type('form')
}

Datomic.prototype.entity = function(id, opts) {
  return get(this.db_uri_ + 'entity')
    .query(merge({e: id}, opts))
    .then(parse)
}

Datomic.prototype.q = function(query, opts) {
  return get(this.root + 'api/query').query(merge({
    args: '[{:db/alias "' + this.db_alias + '"}]',
    q: query
  }, opts)).then(parse)
}

function get(uri) {
  return request.get(uri).accept('application/edn')
}

module.exports = Datomic
