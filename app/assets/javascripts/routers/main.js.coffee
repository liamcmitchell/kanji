App.Routers.Main = Backbone.Router.extend(

  routes: 
    ""                : "test"
    "settings"        : "settings"
    "settings/level"  : "settings_level"
    "sign-in"         : "signin"
    "sign-out"        : "signout"
    "*splat"          : "defaultRoute"

  initialize: ->
    @on 'all', (event) ->
      console.log(event)
  
  test: ->
    # Make sure we have level needed to test
    if (!App.currentUser.level())
      App.destination = '' # come back after choosing level
      App.router.navigate('settings/level', {trigger: true})
      return
    
    App.canvasShow(new App.Views.Tester())
  
  settings: ->
    App.canvasShow(new App.Views.UserSettings())
  
  settings_level: ->
    App.canvasShow(new App.Views.UserJlpt())
  
  signin: ->
    # redirect to root if user is already logged in
    if (App.currentUser.isSignedIn()) 
      @navigate("", true)
    # otherwise show signin page
    else 
      App.canvasShow(new App.Views.UserSignIn())
  
  signout: ->
    App.currentUser.signOut()
  
  defaultRoute: (splat) ->
    # redirect all other paths to root
    @navigate("", true)

)