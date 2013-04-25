App.Views.SignIn = Backbone.View.extend(

  className: "signin dialogue"
  
  initialize: ->
    @render()

  render: ->
    @$el.html HandlebarsTemplates['signin']()

  events:
    "submit #signin": "signIn"
    "submit #register": "register"

  signIn: (event) ->
    event.preventDefault()
    $form = $(event.currentTarget)
    App.ajax
      url: '/auth/identity/callback'
      data: $form.serializeArray()
      success: (data) =>
        window.location = "/"
      fail: (data) =>
        # Display error to the user
        @enable $form
        $form.addClass "error"
        if data.errors
          App.message data, "error"
    @disable $form

  register: (event) ->
    event.preventDefault()
    $form = $(event.currentTarget)
    App.ajax
      url: '/auth/identity/register'
      data: $form.serializeArray()
      success: (data) =>
        window.location = "/"
      fail: (data) =>
        # Display error to the user
        @enable $form
        $form.addClass "error"
        if data.errors
          App.message data, "error"
    @disable $form
)