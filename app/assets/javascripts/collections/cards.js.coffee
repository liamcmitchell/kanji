App.Collections.Cards = Backbone.Collection.extend(

  model: App.Models.Card

  # Return array of testable cards
  testable: ->
    @filter (card) ->
      card.remainingTests().length

  # Return array of tested cards
  tested: ->
    @filter (card) ->
    	if card.remainingTests().length == 0
    		return true

)
