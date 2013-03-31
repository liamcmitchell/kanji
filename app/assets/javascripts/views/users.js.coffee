App.Views.User = Backbone.View.extend(
  className: "user"
  initialize: ->
    @render()
    v = this
    @model.on "change:name", ->
      v.render()

  render: ->
    @$el.html HandlebarsTemplates['user'](
      isSignedIn: @model.isSignedIn()
      name: @model.get('name')
    )

  events: {}
)
App.Views.UserSettings = Backbone.View.extend(
  className: "settings dialogue"
  initialize: ->
    @render()

  render: ->
    @$el.html HandlebarsTemplates['user-settings'](isSignedIn: App.currentUser.isSignedIn())
)
App.Views.UserSignIn = Backbone.View.extend(
  className: "sign-in dialogue"
  initialize: ->
    @render()

  render: ->
    @$el.html HandlebarsTemplates['user-sign-in']()

  events:
    "submit #sign-in": "signInSubmit"
    "submit #register": "registerSubmit"

  signInSubmit: (e) ->
    form = $(e.currentTarget)
    App.disableForm form
    App.currentUser.signIn form.find("input[name=auth_key]").val(), form.find("input[name=password]").val(), (->
      
      # display error to the user
      App.resetForm form
      form.addClass "error"
      App.Models.Message "Sign in failed", "error"
    ), ->
      
      # redirect to start
      App.resetForm form
      App.router.navigate "", true

    false

  registerSubmit: (e) ->
    false
)
App.Views.UserJlpt = Backbone.View.extend(
  className: "dialogue"
  initialize: ->
    App.router.navigate "settings/level"
    @render()

  render: ->
    title = "Select JLPT level"
    title += " or sign in for saved settings"  unless App.currentUser.isSignedIn()
    @$el.html HandlebarsTemplates['jlpt-dialogue']({title: title})

  events:
    "click .button:eq(0)": ->
      App.currentUser.level 1
      @close()

    "click .button:eq(1)": ->
      App.currentUser.level 2
      @close()

    "click .button:eq(2)": ->
      App.currentUser.level 3
      @close()

    "click .button:eq(3)": ->
      App.currentUser.level 4
      @close()

  close: ->
    if typeof App.destination is "string"
      App.router.navigate App.destination, true
      App.destination = null
    else
      App.router.navigate "settings", true
)