schema = require('./schema')
Datomic = require('..').Datomic

datomic = new Datomic('localhost', 8888, 'db', 'test')

beforeNext(-> datomic.ready)

it 'should make transactions', ->
  datomic.transact(schema.movies).then((future) ->
    future.has(':db-after').should.be.true)

it 'should get an entity', ->
  datomic.entity(1).then((entity) ->
    entity.get(':db/id').should.equal(1))

it 'should get an entity with options', ->
  datomic.entity(1, {since:0}).then((entity) ->
    entity.get(':db/id').should.equal(1))

it 'should allow to query', ->
  datomic.transact('[[:db/add #db/id [:db.part/user] :movie/title "trainspotting"]]')
  .then(-> datomic.q('[:find ?m :where [?m :movie/title "trainspotting"]]'))
  .then((movies) -> movies.get(0).get(0).should.be.above(1))

it 'should allow to query with opt', ->
  datomic.transact('[[:db/add #db/id [:db.part/user] :movie/title "the matrix"]]')
  .then(-> datomic.transact('[[:db/add #db/id [:db.part/user] :movie/title "the matrix reloaded"]]'))
  .then(-> datomic.q('[:find ?m :where [?m :movie/title]]', {limit:1, offset:2}))
  .then((movies) -> movies.get(0).get(0).should.be.above(1))

it 'should allow passing arguments to query', ->
  query = '[:find ?first ?height :in [?last ?first ?email] [?email ?height]]'
  args = """[
    ["Doe" "John" "jdoe@example.com"]
    ["jdoe@example.com" 71]
  ]"""
  datomic.q(query, {args: args}).then((data) ->
    data.get(0).get(0).should.equal('John')
    data.get(0).get(1).should.equal(71))
