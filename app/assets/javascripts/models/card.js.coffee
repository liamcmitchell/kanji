# Card model
App.Models.Card = Backbone.Model.extend(

  urlRoot: "/cards"
  
  defaults: ->
    revisions: 0

  initialize: ->
    @kanji = @get("kanji")
    @resetTests()
    @on "change", ->
      if App.user.isSignedIn()
        @save()

  completedTest: (type) ->
    # Reduce test count
    @tests[type.id] -= 1
    
    # If card has been correctly tested enough
    if @remainingTests().length <= 0
      
      # Increment revisions by one
      @set "revisions", @get("revisions") + 1

  # Populate the required test counts
  resetTests: ->
    @tests = {}
    _.each App.testTypes, (type) =>
      @tests[type.id] = type.times

  # Return array of tests not yet completed
  remainingTests: ->
    App.testTypes.filter (type) =>
      @canTest(type) and @tests[type.id] > 0
  
  # Checks if test can be applied to card
  canTest: (test) ->
    @hasAttr(test.question) and @hasAttr(test.answer)

  # Checks if kanji has property
  hasAttr: (attr) ->
    if attr is "reading"
      return (@hasAttr("onyomi") or @hasAttr("kunyomi"))  
    else
      @kanji.hasOwnProperty(attr) and @kanji[attr]

)