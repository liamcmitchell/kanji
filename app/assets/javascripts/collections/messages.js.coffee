App.Collections.Messages = Backbone.Collection.extend(
  model: App.Models.Message
  initialize: ->
    App.user.on('signed-out', =>
      @reset()
    )
)