# display messages to the user
App.message = (type, message) ->
  App.messages.add(type: type, message: message)
  
App.Message = Backbone.Model.extend(
  defaults: ->
    type: 'info'
    seen: false
)

App.Messages = Backbone.Collection.extend(
  model: App.Message
  initialize: ->
    m = this
    App.currentUser.on('signed-out', ->
      m.reset()
    )
)

App.MessageView = Backbone.View.extend()
