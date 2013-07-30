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
    # {id: 2, question: 'meaning', answer: 'literal', times: 1}
    # {id: 3, question: 'literal', answer: 'reading', times: 1}
    # {id: 4, question: 'reading', answer: 'literal', times: 1}
  ]

  levels: [
    {id: 'jlpt1', desc: 'JLPT 1 (most difficult)'}
    {id: 'jlpt2', desc: 'JLPT 2'}
    {id: 'jlpt3', desc: 'JLPT 3'}
    {id: 'jlpt4', desc: 'JLPT 4 (easiest)'}
  ]

  init: ->

    @authenticity_token = $('meta[name=csrf-token]').attr("content")

    @user     = new @Models.User(USER)
    @tests    = new @Collections.Tests
    @messages = new @Collections.Messages
    @main     = new @Views.Main
    @router   = new @Routers.Main
    
    Backbone.history.start()

  # Wrapper for jQuery.ajax()
  ajax: (settings) ->
    defaults = 
      dataType: "json"
      type: "POST"
      data:
        authenticity_token: @authenticity_token
      error: ( jqXHR, textStatus, errorThrown) ->
        # Use our own callback which can handle errors in json format
        if typeof @fail is "function"
          try
            data = jQuery.parseJSON jqXHR.responseText
          catch e
            data = {errors: [jqXHR.responseText]}
          @fail data, textStatus, jqXHR
          

    # Merge settings with defaults
    jQuery.extend true, defaults, settings
      
    jQuery.ajax defaults

  # Display a message
  message: (message, type = 'info') ->
    # Handle our json error objects
    if message.errors
      message = message.errors.join "<br>"

    App.messages.add
      message: message
      type: type

# Extend backbone objects

# Used in frame views to replace current content with new
Backbone.View.prototype.show = (view) ->
  @newView = view

  replaceView = =>
    # Only continue if @newView is the same when this function was made
    if @newView == view
      if @currentView
        @currentView.trigger('remove')
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
