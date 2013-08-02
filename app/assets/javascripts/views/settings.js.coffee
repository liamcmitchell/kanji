App.Views.Settings = Backbone.View.extend(

  className: "settings"
  
  initialize: ->
    @render()

  render: ->
    @$el.html HandlebarsTemplates['settings'](
      isSignedIn: App.user.isSignedIn()
      levels: App.levels
    )
    @$("option[value=" + App.user.level() + "]").attr('selected', 'selected')

  events:
    'submit form': (event) ->
      event.preventDefault()
      @update()
    'change input, textarea, select': 'update'

  update: ->
    App.user.level @$el.find('select[name=level]').val()
    App.message "Updated."

)