App.Views.Messages = Backbone.View.extend(

  el: '#messages'
  
  initialize: ->
    @children = []
    @adjust()
    @listenTo @model, 'add', (message) ->
      view = new App.Views.Message model: message
      @children.push view
      @$el.append view.$el
  
  adjust: ->
    left = ($(document).width() - @$el.width()) / 2
    @$el.css(left: left + 'px')

)
