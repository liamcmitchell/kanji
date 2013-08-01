App.Views.Test = Backbone.View.extend(

  className: "test row-fluid"
  
  initialize: ->
    @render()

    @on "show resize", ->
      @center()

  render: ->
    t = @model # test
    
    # Add question card.
    $question = $('<div class="question offset1 span3"></div>')
    questionCard = new App.Views.Card(model: t.card).show(t.type.question)
    $question.append questionCard.$el
    
    # Add option cards.
    $options = $ '<div class="options span8"></div>'
    _.each t.options, (card, i) =>
      option = new App.Views.Card(model: card, i: i)
      
      # Show answer part of card.
      option.show t.type.answer
      
      # Add listener for click.
      option.on "click", ->
        # Check result and mark accordingly.
        if t.check(card) is true
          option.$el.addClass "correct"
        else
          option.$el.addClass "incorrect"
          option.show t.type.question

      $options.append option.$el
      
    # Add to dom.
    @$el.append $question, $options

)