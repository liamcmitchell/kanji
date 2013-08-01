App.Views.Loading = Backbone.View.extend(

  className: "loading"
  
  initialize: ->
    @render()

    @on 'show resize', ->
    	@center()

  render: ->
    @$el.html "Loading..."

)