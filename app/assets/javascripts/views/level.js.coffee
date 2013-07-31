App.Views.Level = Backbone.View.extend(

  className: "dialogue"
  
  initialize: ->
    @render()
    # Background element needs to be added first so render doesn't continue indefinitely
    $('#app').append '<div id="background"/>'
    @backgroundView = new App.Views.Background(el: '#background')
    @on "remove", ->
      @backgroundView.trigger "remove"
      @backgroundView.remove()

  render: ->
    @$el.html HandlebarsTemplates['level'](
      isSignedIn: App.user.isSignedIn()
      levels: App.levels
    )

  events:
    "click button": (event) ->
      App.user.level $(event.currentTarget).attr 'level'
      @backgroundView.$el.animate {opacity:0}, App.options.speed, 'linear'
      @trigger "select"

    "mouseover button": (event) ->
      @backgroundView.highlight($(event.currentTarget).attr('level'))

    "mouseout button": ->
      @backgroundView.highlight()

)