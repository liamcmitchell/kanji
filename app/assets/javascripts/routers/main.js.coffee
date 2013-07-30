App.Routers.Main = Backbone.Router.extend(

  routes: 
    ""                : "test"
    "settings"        : "settings"
    "sign-in"         : "signin"
    "sign-out"        : "signout"
    "*splat"          : "defaultRoute"

  # Helper function to cache singleton views and pass to main view
  show: (view) ->
    App.main.content.show new App.Views[view]
  
  test: ->
    @show 'Tester'
  
  settings: ->
    @show 'Settings'
  
  signin: ->
    # Redirect to root if user is already logged in
    if (App.user.isSignedIn()) 
      @navigate("", true)
    else 
      @show 'SignIn'
  
  signout: ->
    # No view needed
    App.user.signOut()
  
  defaultRoute: (splat) ->
    # Redirect all other paths to root
    @navigate("", true)

)