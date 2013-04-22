App.Models.User = Backbone.Model.extend(

  urlRoot: "/users"
  
  initialize: ->
    
    @on "change", ->
      if @isSignedIn()
        @save()

    @cards = new App.Collections.Cards
    @checkCards()
    @on "change", ->
      @checkCards()
    @cards.on "change", =>
      @checkCards()

  isSignedIn: ->
    not @isNew()

  canGetCards: ->
    !!@level() and not @gettingCards and @cards.testable().length < App.options.testingCardsSize

  # Make sure user has full set of cards.
  checkCards: ->

    # Only check server if we can and are short
    if @canGetCards()
      @gettingCards = true
      $.ajax(
        url: "/cards/current"
        type: "POST"
        data:
          level: @level()
          limit: App.options.testingCardsSize - @cards.testable().length
          card_not_in: @cards.pluck("id")
          kanji_not_in: _.pluck(@cards.pluck("kanji"), "id")
      ).done((data, textStatus, jqXHR) =>
        @gettingCards = false
        if !data or !data.length
          console.log "Server returned empty result", data, jqXHR
          # TODO alert user if they are running out of cards.
        else
          @cards.add data
      ).error () =>
        @gettingCards = false

  # Return level or set if provided.
  level: (level) ->
    settings = @settings()
    settings = {}  unless typeof (settings) is "object"
    settings.level = null  unless settings.level
    if level
      settings.level = level
      @settings settings
    settings.level

  
  # Return or set settings object.
  # Needed to call change event on set.
  settings: (settings) ->
    if settings
      @set "settings", settings
      @trigger 'change'
    else
      settings = @get("settings")
    settings

  # TODO shouldn't be here.
  signOut: ->
    $.ajax(
      url: "/signout"
      type: "GET"
    ).done ->
      window.location = "/"

)