App.Models.Test = Backbone.Model.extend(
  defaults: ->
    {}

  initialize: ->
    
    # choose from available cards
    @cards = App.Models.TestingCards.random(4)
    @card = @cards.random().at(0)
    
    # make sure card is different from previous test
    @card = @cards.random().at(0)  while @card is App.previousCard
    App.previousCard = @card
    
    # choose type of test
    @type = _.first(_.shuffle(@card.remainingTests()))
    
    # blank result to start
    @result = null

  check: (answer) ->
    result = (answer is @card)
    if result is true
      @trigger "completed correct"
      @result = "correct"  unless @result
      @card.resetTests()  if @result is "incorrect"
      @card.completedTest @type  if @result is "correct"
    else
      @trigger "incorrect"
      @result = "incorrect"  unless @result
    result
)

App.Models.Tests = Backbone.Collection.extend(model: App.Models.Test)