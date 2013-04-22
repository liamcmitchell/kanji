#= require_self
#= require_tree ./templates
#= require_tree ./models
#= require_tree ./views
#= require_tree ./routers

jQuery ->
  App.init()

# App namespace
window.App =

  Models: {}
  Collections: {}
  Routers: {}
  Views: {}

  options:
    speed: 200             # base unit for animation and pause speed
    testingCardsSize: 7    # number of cards that will be tested at the same time

  testTypes: [
    {id: 1, question: 'literal', answer: 'meaning', times: 1}
    {id: 2, question: 'meaning', answer: 'literal', times: 1}
    {id: 3, question: 'literal', answer: 'reading', times: 1}
    {id: 4, question: 'reading', answer: 'literal', times: 1}
  ]

  levels: [
    {id: 'jlpt1', desc: 'JLPT 1 (most difficult)'}
    {id: 'jlpt2', desc: 'JLPT 2'}
    {id: 'jlpt3', desc: 'JLPT 3'}
    {id: 'jlpt4', desc: 'JLPT 4 (easiest)'}
  ]

  init: ->

    # Set ajax defaults
    $.ajaxSetup
      data:
        authenticity_token: $('meta[name=csrf-token]').attr("content")
      dataType: "json"

    # Log all ajax errors
    $(document).ajaxError (event, request, settings) ->
      console.log('AJAX failed', event, request, settings)

    App.user     = new App.Models.User(USER)
    App.tests    = new App.Collections.Tests
    App.main     = new App.Views.Main
    App.router   = new App.Routers.Main
    App.messages = new App.Collections.Messages

    Backbone.history.start()

# Extend backbone objects

# Used in frame views to replace current content with new
Backbone.View.prototype.show = (view) ->
  @newView = view

  replaceView = =>
    # Only continue if @newView is the same when this function was made
    if @newView == view
      if @currentView
        @currentView.remove()
      @currentView = @newView
      @newView = null
      @$el.css({opacity:0}).html(@currentView.$el).animate {opacity:1}, App.options.speed, 'linear'

  if @currentView
    @$el.animate {opacity:0}, App.options.speed, 'linear', ->
      window.setTimeout replaceView, App.options.speed
  else
    replaceView()

# Form helper
Backbone.View.prototype.disable = ($el) -> 
  $el.find('input').attr('disabled', 'disabled')

# Form helper
Backbone.View.prototype.enable = ($el) ->
  $el.find('input:disabled').removeAttr('disabled')
  $el.removeClass('error')
  $el.find('.error').remove()
