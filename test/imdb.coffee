schema = require('./schema')
find = require('../query')
Datomic = require('..')
edn = require('jsedn')

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
    .then((movies) -> parse(movies).length.should.be.above(1))

  it 'should find a movie over 8.8', ->
    imdb.q('[:find ?t :where [?m :movie/title ?t] [?m :movie/rating ?r] [(> ?r  8.8)]]')
    .then((movies) -> parse(movies).should.eql([['pulp fiction']]))

  it 'should find any movie', ->
    imdb.q('[:find ?m :in $ ?t :where [?m :movie/title ?t]]',
           {args: '[{:db/alias "db/imdb"} "fight club"]'})
    .then((movie) -> parse(movie)[0][0].should.be.above(2))

  it 'should find trainspotting', ->
    imdb.q('[:find ?e :where [?e :movie/title "trainspotting"]]')
    .then((movies) -> imdb.entity(parse(movies)[0][0]))
    .then((movie) -> parse(movie)['movie/title'].should.equal('trainspotting'))

parse = (edn_str) -> edn.toJS(edn.parse(edn_str))
