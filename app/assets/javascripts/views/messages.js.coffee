App.Views.Message = Backbone.View.extend(
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
    App.Models.Messages.view.$el.append(this.$el);
    App.show(this.$el)
    this.timer = setTimeout(
      => this.hide(),
      App.options.speed * 20
    )
  hide: ->
    clearTimeout(this.timer)
    App.hide(this.$el, =>
      this.$el.hide()
    )
)

App.Views.Messages = Backbone.View.extend(
  el: '#messages'
  initialize: ->
    this.adjust()
  adjust: ->
    left = ($(document).width() - this.$el.width()) / 2
    this.$el.css(left: left + 'px')
)
