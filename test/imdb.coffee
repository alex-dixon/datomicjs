{ Datomic } = require src + 'datomic'
{ edn, find } = require src + 'edn'
schema = require './schema'

describe 'Sample with movies', ->

  imdb = new Datomic 'localhost', 8888, 'db', 'imdb'

  add_movie = (id, title, done) ->
    imdb.transact [[':db/add', id, ':title', title]], ->
      done()

  before (done) ->
    
    imdb.createDatabase ->
      imdb.transact schema.movies, ->
        add_movie 1, 'pulp fiction', ->
          add_movie 2, 'fight club', ->
            add_movie 3, 'lola rennt', ->
              add_movie 4, 'trainspotting', ->
                done()

  it 'should return all', (done) ->

    imdb.q [':find', '?m', ':where', ['?m', ':title']], (err, movies)->
      movies.length.should.equal 4
      done()
    
  it 'should find trainspotting', (done) ->
    
    imdb.q find('?m').where('?m', ':title', 'trainspotting'), (err, movies) ->
      imdb.entity movies[0][0], (err, movie) ->
        movie.title.should.equal 'trainspotting'
        done()
  
  it 'should find the highest rated movie', (done) ->
    
    imdb.q find('?t').where('?m', ':title', '?t'), (err, movies) ->
      console.log movies
      done()
  
