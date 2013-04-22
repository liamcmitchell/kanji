App.Views.Message = Backbone.View.extend(
  className: 'message'
  initialize: ->
    @render()
    @show()
  render: ->
    @$el.addClass(@model.get('type'))
    @$el.html('<div class="hide">x</div>' + @model.get('message'))
  events:
    'click .hide': 'hide'
  show: ->
    @$el.css(opacity:0)
    App.Collections.Messages.view.$el.append(@$el);
    App.show(@$el)
    @timer = setTimeout(
      => @hide(),
      App.options.speed * 20
    )
  hide: ->
    clearTimeout(@timer)
    App.hide(@$el, =>
      @$el.hide()
    )
)

App.Views.Messages = Backbone.View.extend(
  el: '#messages'
  initialize: ->
    @adjust()
  adjust: ->
    left = ($(document).width() - @$el.width()) / 2
    @$el.css(left: left + 'px')
)
