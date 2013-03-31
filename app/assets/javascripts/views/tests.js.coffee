App.Views.Tester = Backbone.View.extend(
  className: "tester"
  initialize: ->
    
    # If test already exists, go back to it
    @nextTest App.currentTest

  render: ->

  nextTest: (test) ->
    v = this
    unless test
      
      # Make new test if cards are available
      if App.Models.TestingCards.length
        test = new App.Models.Test
      else
        
        # Update cards (async)
        App.Models.TestingCards.update ->
          v.nextTest()

        
        # Show loading screen
        v.$el.html '<div class="loading">Loading...</div>'
        return
    if test
      
      # Update currentTest
      App.currentTest = test
      
      # Set callback to start next test once completed
      test.on "completed", ->
        setTimeout (->
          v.nextTest()
        ), App.options.speed * 2

      
      # Show test
      # TODO: only animate if replacing old test
      App.a.slide v.$el, new App.Views.Test(model: test).$el
    else
      console.log "No test to display"
)

App.Views.Test = Backbone.View.extend(
  className: "test"
  initialize: ->
    @render()

  render: ->
    v = this # view
    t = @model # test
    
    v.$el.html '<div class="question"></div><div class="options"></div>'
    
    # add question card
    questionCard = new App.Views.CardView(model: t.card).show(t.type.question)
    v.$el.find(".question").append questionCard.$el
    
    # add option cards
    t.cards.each (card) ->
      option = new App.Views.CardView(model: card)
      
      # Show answer part of card
      option.show t.type.answer
      
      # Add listener for click
      option.$el.on "click", ->
        
        # Check result and mark accordingly
        if t.check(card) is true
          option.$el.addClass "correct"
        else
          option.$el.addClass "incorrect"
          option.show t.type.question

      
      # Add to dom
      v.$el.find(".options").append option.$el

)