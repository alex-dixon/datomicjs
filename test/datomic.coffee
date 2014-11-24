schema = require('./schema')
Datomic = require('..')
edn = require('jsedn')

datomic = new Datomic('localhost', 8888, 'db', 'test')

it 'should create a DB', ->
  datomic.ready.then(-> datomic.db()).then((db) ->
    parse(db)['db/alias'].should.equal('db/test'))

it 'should fetch available storage aliases', ->
  datomic.storages().then((storages) ->
    parse(storages).should.containEql('db'))

it 'should fetch a list of databases for a storage alias', ->
  datomic.databases('db').then((databases) ->
    parse(databases).should.containEql('test'))

it 'should make transactions', ->
  datomic.transact(schema.movies).then((future) ->
    future.should.containEql(':db-after'))

it 'should get datoms', ->
  datomic.datoms('eavt').then((datoms) ->
    datoms.should.not.be.empty)

it 'should get datoms with options', ->
  datomic.datoms('avet', {limit:1}).then((datoms) ->
    parse(datoms).length.should.equal(1))

it 'should get a range of index data', ->
  datomic.indexRange('db/ident').then((datoms) ->
    datoms.should.not.be.empty)

it 'should get an entity', ->
  datomic.entity(1).then((entity) ->
    parse(entity)['db/id'].should.equal(1))

it 'should get an entity with options', ->
  datomic.entity(1, {since:0}).then((entity) ->
    parse(entity)['db/id'].should.equal(1))

it 'should allow to query', ->
  datomic.transact('[[:db/add #db/id [:db.part/user] :movie/title "trainspotting"]]')
  .then(->
    datomic.q('[:find ?m :where [?m :movie/title "trainspotting"]]'))
  .then((movies) ->
    parse(movies)[0][0].should.be.above(1))

it 'should allow to query with opt', ->
  datomic.transact('[[:db/add #db/id [:db.part/user] :movie/title "the matrix"]]')
  .then(->
    datomic.transact('[[:db/add #db/id [:db.part/user] :movie/title "the matrix reloaded"]]'))
  .then(->
    datomic.q('[:find ?m :where [?m :movie/title]]', {limit:1, offset:2}))
  .then((movies) ->
    parse(movies)[0][0].should.be.above(1))

it 'should allow passing arguments to query', ->
  query = '[:find ?first ?height :in [?last ?first ?email] [?email ?height]]'
  args = """[
    ["Doe" "John" "jdoe@example.com"]
    ["jdoe@example.com" 71]
  ]"""
  datomic.q(query, {args: args}).then((result) ->
    data = parse(result)
    data[0][0].should.equal 'John'
    data[0][1].should.equal 71)

parse = (edn_str) -> edn.toJS(edn.parse(edn_str))
