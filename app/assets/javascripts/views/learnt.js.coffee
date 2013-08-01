App.Views.Learnt = Backbone.View.extend(

  el: '#learnt'
  
  initialize: ->
    @render()
    @listenTo @model, 'change', ->
      @render()
  
  render: ->
    learnt = []
    _.each @model.tested(), (card) ->
      learnt.push card.kanji.literal

    @$el.html learnt.reverse().join(" ")

)
