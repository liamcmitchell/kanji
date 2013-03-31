App.Models.User = Backbone.Model.extend(
  urlRoot: "/users"
  initialize: ->
    console.log "User " + @get("name") + " loaded"  if @isSignedIn()
    @on "change", (->
      
      # don't save if the user is being changed (sign in/out)
      # the id attr shows when this happens
      if @isSignedIn() and not @changedAttributes().hasOwnProperty("id")
        console.log "Updating user"
        @save()
    ), this

  isSignedIn: ->
    not @isNew()

  signIn: (auth_key, password, onFail, onSucceed) ->
    u = this
    $.ajax
      url: "/auth/identity/callback"
      type: "POST"
      data:
        auth_key: auth_key
        password: password

      error: onFail
      success: (data, textStatus, jqXHR) ->
        
        # server responds with json false if login failed
        if data
          App.reset()
          u.set data
          console.log "User " + u.get("name") + " loaded"
          onSucceed data, textStatus, jqXHR
        else
          onFail jqXHR, textStatus, "Login failed"

      context: this

    this

  signOut: ->
    u = this
    $.ajax(
      url: "/signout.json"
      type: "POST"
    ).done ->
      console.log "Signed out"
      App.reset()
      App.router.navigate "", true


  
  # return level or set if provided
  level: (level) ->
    settings = @settings()
    settings = {}  unless typeof (settings) is "object"
    settings.level = null  unless settings.level
    if level
      settings.level = level
      @settings settings
    settings.level

  
  # return or set settings object
  # needed to call change event on set
  settings: (settings) ->
    if settings
      @set "settings", settings
      @trigger "change"
    else
      settings = @get("settings")
    settings
)