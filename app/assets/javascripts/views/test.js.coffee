App.Views.Test = Backbone.View.extend(

  className: "test"
  
  initialize: ->
    @render()

  render: ->
    t = @model # test
    
    $question = $ '<div class="row question"></div>'
    
    # Add question card.
    questionCard = new App.Views.Card(model: t.card).show(t.type.question)
    questionCard.$el.addClass 'question'
    container = $('<div class="offset4 span4"/>').append questionCard.$el
    $question.append container
    
    # Add option cards.
    $options = $ '<div class="row options"></div>'
    _.each t.options, (card, i) =>
      option = new App.Views.Card(model: card)
      
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

      container = $('<div class="span2"/>')
      container.addClass 'offset2' if i == 0
      container.append option.$el
      $options.append container
      
    # Add to dom.
    @$el.append $question, $options

)