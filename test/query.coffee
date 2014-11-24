find = require('../query')

describe 'query', ->
  it 'find().where()', ->
    find('?m')
      .where('?m', ':movie/title', 'trainspotting')
      .toString()
      .should.equal('[:find ?m :where [?m :movie/title trainspotting]]')
