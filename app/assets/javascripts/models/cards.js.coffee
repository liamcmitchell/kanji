# Card model
App.Models.Card = Backbone.Model.extend(

  urlRoot: "/cards"
  
  defaults: ->
    revisions: 0

  initialize: ->
    @kanji = @get("kanji")
    @resetTests()
    @on "change", ->
      if App.currentUser.isSignedIn()
        console.log "Updating card"
        @save()


  completedTest: (type) ->
    @tests[type.id] -= 1
    
    # If card has been correctly tested enough
    if @remainingTests().length is 0
      
      # Increment revisions by one
      @set "revisions", @get("revisions") + 1
      @resetTests()
      
      # Update card sets
      App.Models.TestingCards.remove this
      App.learntCards.add this
      App.Models.TestingCards.update()

  resetTests: ->
    @tests = {}
    tests = @tests
    _.each App.Models.TestTypes, (type) ->
      tests[type.id] = type.times

  # Return array of tests not yet completed
  remainingTests: ->
    card = this
    _.filter App.Models.TestTypes, (type) ->
      card.canTest(type) and card.tests[type.id] > 0
  
  # Checks if test can be applied to card
  canTest: (test) ->
    @hasAttr(test.question) and @hasAttr(test.answer)

  # Checks if kanji has property
  hasAttr: (attr) ->
    return (@hasAttr("onyomi") or @hasAttr("kunyomi"))  if attr is "reading"
    @kanji.hasOwnProperty(attr) and @kanji[attr]

)

App.Models.Cards = Backbone.Collection.extend(

  model: App.Models.Card
  
  # Return random set of specified length
  random: (num) ->
    result = new App.Models.Cards
    return result  if @length is 0
    num = 1  unless num
    num = @length  if num > @length
    picked = []
    while result.length < num
      i = Math.floor((Math.random() * @length))
      if _.lastIndexOf(picked, i) is -1
        picked.push i
        result.add @at(i)
    result

  # Update card set from server (only intended for App.Models.TestingCards)
  update: (callback) ->
    return true  if @length >= App.options.testingCardsSize
    Cards = this
    $.ajax(
      url: "/cards/next"
      type: "POST"
      data:
        level: App.currentUser.level()
        limit: App.options.testingCardsSize - Cards.length
        card_not_in: Cards.pluck("id")
        kanji_not_in: _.pluck(Cards.pluck("kanji"), "id")
    ).done (data) ->
      Cards.add data
      console.log "Fetched " + data.length + " card(s)"
      
      # TODO alert user if they are running out of cards?
      callback()  if typeof (callback) is "function"

)
