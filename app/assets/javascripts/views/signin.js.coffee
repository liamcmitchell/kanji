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
    $.ajax
      url: '/auth/identity/callback'
      type: 'POST'
      data: $form.serialize()
      success: (data, textStatus, jqXHR) ->
        # Server responds with json false if login failed
        if data
          window.location = "/"
        else
          # Display error to the user
          @enable $form
          $form.addClass "error"
          App.Models.Message "Sign in failed", "error"
    @disable $form

  register: (event) ->
    event.preventDefault()
    $form = $(event.currentTarget)
    $.ajax
      url: '/auth/identity/register'
      type: 'POST'
      data: $form.serialize()
      success: (data, textStatus, jqXHR) ->
        # Server responds with json false if login failed
        if data
          window.location = "/"
        else
          # Display error to the user
          @enable $form
          $form.addClass "error"
          App.Models.Message "Registration failed", "error"
    @disable $form
)