App.Collections.Cards = Backbone.Collection.extend(

  model: App.Models.Card

  # Return array of testable cards
  testable: ->
    @filter (card) ->
      card.remainingTests().length

)
