App.Collections.Tests = Backbone.Collection.extend(
	model: App.Models.Test

	# Return next test
	next: ->
    if @current()
      @current()
    else
      @new()

  # Return latest incomplete test
  current: ->
    _.last(@filter( (test) ->
      (test.result == null)
    ))

	# Return new test or false if unable
  new: ->
    # Need 4 cards
    options = _.shuffle(App.user.cards.testable()).slice(0, 4)
    if options.length == 4

      # Build test object.
      test = new @model
      test.options = options
      # Card shouldn't be the same as last time.
      test.card = _.shuffle(_.reject(options, (c) => 
        true if @last() and c is @last().card
      ))[0]
      test.type = _.first(_.shuffle(test.card.remainingTests()))
      # Add to collection
      @add test
      
      return test

    else
      return false
)