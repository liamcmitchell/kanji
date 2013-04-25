App.Views.Message = Backbone.View.extend(

  className: 'alert'

  initialize: ->
    @render()

  render: ->
    @$el.html HandlebarsTemplates['message'](
      message: @model.get("message")
    )
    @$el.addClass "alert-" + @model.get("type")

  events:
    'click .close': 'close'

  close: ->
    @model.set "closed", true
    @remove()

)
