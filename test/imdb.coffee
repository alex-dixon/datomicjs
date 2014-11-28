schema = require('./schema')
find = require('../query')
Datomic = require('..')

imdb = new Datomic('localhost', 8888, 'db', 'imdb')

add_movie = (title, rating) ->
  imdb.transact("""[
    {:db/id #db/id[:db.part/user]
     :movie/title "#{title}"
     :movie/rating #{rating}}]""")

describe 'Sample with movies', ->
  beforeNext ->
    imdb.ready
    .then(-> imdb.transact(schema.movies))
    .then(-> add_movie('trainspotting', 8.2))
    .then(-> add_movie('pulp fiction', 8.9))
    .then(-> add_movie('fight club', 8.8))
    .then(-> add_movie('lola rennt', 7.9))

  it 'should return all', ->
    imdb.q('[:find ?m :where [?m :movie/title]]')
    .then((movies) -> movies.size.should.be.above(1))

  it 'should find a movie over 8.8', ->
    imdb.q('[:find ?t :where [?m :movie/title ?t] [?m :movie/rating ?r] [(> ?r  8.8)]]')
    .then((movies) -> movies.toJS().should.eql([['pulp fiction']]))

  it 'should find any movie', ->
    imdb.q('[:find ?m :in $ ?t :where [?m :movie/title ?t]]',
           {args: '[{:db/alias "db/imdb"} "fight club"]'})
    .then((movies) -> movies.size.should.be.above(0))

  it 'should find trainspotting', ->
    imdb.q('[:find ?e :where [?e :movie/title "trainspotting"]]')
    .then((movies) -> imdb.entity(movies.get(0).get(0)))
    .then((movie) -> movie.get(':movie/title').should.eql('trainspotting'))
