App.Views.Level = Backbone.View.extend(

  className: "dialogue"
  
  initialize: ->
    @render()

  render: ->
    @$el.html HandlebarsTemplates['level'](
      isSignedIn: App.user.isSignedIn()
      levels: App.levels
    )

  events:
    "click button": (event) ->
      App.user.level $(event.currentTarget).attr 'level'
      @trigger "select"

)