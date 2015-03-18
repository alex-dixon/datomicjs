class Query
  constructor: (args...) ->
    @data = [':find ' + args.join(' ')]

  in: (args...) ->
    @data.push(':in $ ' + args.join(' '))
    @

  where: (args...) ->
    @data.push(':where [' + args.join(' ') + ']')
    @

  and: (args...) ->
    @data.push('[' + args.join(' ') + ']')
    @

  lt: (args...) ->
    @data.push('[(< ' + args.join(' ') + ')]')
    @

  toString: ->
    '[' + @data.join(' ') + ']'

module.exports = (args...) -> new Query(args)
