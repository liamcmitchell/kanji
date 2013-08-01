App.Views.Level = Backbone.View.extend(

  className: "level-select"
  
  initialize: ->
    @render()

    @on 'show resize', ->
      @center()

  render: ->
    @$el.html HandlebarsTemplates['level'](
      isSignedIn: App.user.isSignedIn()
      kanjis: KANJIS
    )

  events:
    "click .level": (event) ->
      App.user.level $(event.currentTarget).attr 'level'
      @trigger "select"

)