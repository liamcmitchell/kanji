#= require_self
#= require_tree ./templates
#= require_tree ./models
#= require_tree ./views
#= require_tree ./routers

window.App =

  Models: {}
  Collections: {}
  Routers: {}
  Views: {}

  options:
    speed: 150               # base unit for animation and pause speed
    testingCardsSize: 7    # number of cards that will be tested at the same time

  testTypes: [
    {id: 1, question: 'literal', answer: 'meaning', times: 1},
    {id: 2, question: 'meaning', answer: 'literal', times: 0},
    {id: 3, question: 'literal', answer: 'reading', times: 0},
    {id: 4, question: 'reading', answer: 'literal', times: 0}
  ]

  init: ->

    console.log('App', App)

    # Set ajax defaults
    $.ajaxSetup
      data:
        authenticity_token: $('meta[name=csrf-token]').attr("content")
      dataType: "json"

    # Log all ajax errors
    $(document).ajaxError (event, request, settings) ->
      console.log('AJAX failed', event, request, settings)

    App.lock            = false
    App.$canvas         = $('#canvas')
    App.router          = new App.Routers.Main
    App.currentUser     = new App.Models.User(USER)
    App.Models.TestingCards    = new App.Models.Cards
    App.learntCards     = new App.Models.Cards
    App.previousTests   = new App.Models.Tests
    App.Models.Messages        = new App.Models.Messages

    # Set up keyboard listeners
    # TODO move to views
    $(document).bind 'keydown.1', -> App.$canvas.find('.options > div:eq(0)').trigger('click')
    $(document).bind 'keydown.2', -> App.$canvas.find('.options > div:eq(1)').trigger('click')
    $(document).bind 'keydown.3', -> App.$canvas.find('.options > div:eq(2)').trigger('click')
    $(document).bind 'keydown.4', -> App.$canvas.find('.options > div:eq(3)').trigger('click')

    # Set user interface
    $('#user').html( new App.Views.User({model: App.currentUser}).$el)

    Backbone.history.start()

  # Reset app (when user changes)
  # TODO move to event bindings?
  reset: ->
    App.currentUser.clear()
    App.currentTest = null
    App.Models.TestingCards.reset()
    App.learntCards.reset()
    App.previousTests.reset()
    App.Models.Messages.reset()


  nextTest: ->
    App.canvasShow new App.Views.Test

  # Show new view on canvas
  canvasShow: (view) ->
    App.$canvas.html(view.$el)

  message: (message, type = 'info') ->
    App.Models.Messages.add(type: type, message: message)

  # Animation functions
  a:
    slide: (container, content) ->
      App.lock = true
      App.a.hide container, ->
        container.html(content)
        setTimeout( ->
          App.lock = false
          App.a.show(container)
        , App.options.speed)

    hide: (object, callback) -> 
      object.css({position: 'relative'}).animate({opacity:0, left: '-100px'}, App.options.speed, 'swing', callback)

    show: (object, callback) ->
      object.css({position: 'relative', left: '100px'}).animate({opacity: 1, left: '0'}, App.options.speed, 'swing', callback)

  # Form helper
  disableForm: (form) -> 
    form.find('input').attr('disabled', 'disabled')

  # Form helper
  resetForm: (form) ->
    form.find('input:disabled').removeAttr('disabled')
    form.removeClass('error')
    form.find('.error').remove()

jQuery ->
  App.init()
