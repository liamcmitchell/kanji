# display messages to the user
App.message = (message, type = 'info') ->
  App.messages.add(type: type, message: message)
  
App.Message = Backbone.Model.extend(
  defaults: ->
    type: 'info'
    seen: false
  initialize: ->
    new App.MessageView(model: this)
)

App.Messages = Backbone.Collection.extend(
  model: App.Message
  initialize: ->
    App.currentUser.on('signed-out', =>
      this.reset()
    )
    this.view = new App.MessagesView(model:this)
)

App.MessageView = Backbone.View.extend(
  className: 'message'
  initialize: ->
    this.render()
    this.show()
  render: ->
    this.$el.addClass(this.model.get('type'))
    this.$el.html('<div class="hide">x</div>' + this.model.get('message'))
  events:
    'click .hide': 'hide'
  show: ->
    this.$el.css(opacity:0)
    App.messages.view.$el.append(this.$el);
    App.show(this.$el)
    this.timer = setTimeout(
      => this.hide(),
      App.options.speed * 10
    )
  hide: ->
    clearTimeout(this.timer)
    App.hide(this.$el, =>
      this.$el.hide()
    )
)

App.MessagesView = Backbone.View.extend(
  el: '#messages'
  initialize: ->
    this.adjust()
  adjust: ->
    left = ($(document).width() - this.$el.width()) / 2
    this.$el.css(left: left + 'px')
)
