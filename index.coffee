request = require('solicit')
merge = require('merge')

class Datomic
  constructor: (server, port, alias, name) ->
    @root = "http://#{server}:#{port}/"
    @db_alias = alias + '/' + name
    @db_uri = "#{@root}data/#{@db_alias}/"
    @db_uri_ = @db_uri + '-/'
    @ready = request.post("#{@root}data/#{alias}/")
      .accept('application/edn')
      .send({'db-name': name})
      .type('form')
      .then()

  storages: -> get("#{@root}data/")

  databases: (alias) -> get("#{@root}data/#{alias}/")

  db: -> get(@db_uri_)

  transact: (data) ->
    request.post(@db_uri)
      .accept('application/edn')
      .send({'tx-data': data})
      .type('form')

  datoms: (index, opts) ->
    get("#{@db_uri_}datoms").query(merge({index: index}, opts))

  indexRange: (attrid, opts) ->
    get("#{@db_uri_}datoms").query(merge({a: attrid}, opts))

  entity: (id, opts) ->
    get("#{@db_uri_}entity").query(merge({e: id}, opts))

  q: (query, opts) ->
    get("#{@root}api/query").query(merge({
      q: if query.edn? then query.edn() else query,
      args: "[{:db/alias \"#{@db_alias}\"}]"
    }, opts))

get = (uri) -> request.get(uri).accept('application/edn')

module.exports = Datomic
