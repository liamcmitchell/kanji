App.Models.Test = Backbone.Model.extend(

  initialize: ->    
    @result = null
    
    @on "completed", ->
      if @result == "correct"
        @card.completedTest @type
      else
        @card.resetTests()

  check: (answer) ->
    if answer == @card
      @result = "correct" unless @result
      @trigger "completed"
      return true
    else
      @result = "incorrect" unless @result
      return false
)