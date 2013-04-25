App.Views.Settings = Backbone.View.extend(

  className: "settings dialogue"
  
  initialize: ->
    @render()

  render: ->
    @$el.html HandlebarsTemplates['settings'](
      isSignedIn: App.user.isSignedIn()
      levels: App.levels
    )
    @$("option[value=" + App.user.level() + "]").attr('selected', 'selected')

  events:
    'submit': (event) ->
      event.preventDefault()
      App.user.level @$el.find('#level').val()

)