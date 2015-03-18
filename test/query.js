var find;

find = require('../query');

describe('query', function() {
  return it('find().where()', function() {
    return find('?m').where('?m', ':movie/title', 'trainspotting').toString().should.equal('[:find ?m :where [?m :movie/title trainspotting]]');
  });
});
