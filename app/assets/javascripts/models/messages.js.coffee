App.Models.Message = Backbone.Model.extend(
  defaults: ->
    type: 'info'
    seen: false
  initialize: ->
    new App.Views.Message(model: this)
)

App.Models.Messages = Backbone.Collection.extend(
  model: App.Models.Message
  initialize: ->
    App.currentUser.on('signed-out', =>
      @reset()
    )
    @view = new App.Views.Messages(model:this)
)