App.Views.Loading = Backbone.View.extend(

  className: "loading"
  
  initialize: ->
    @render()

  render: ->
    @$el.html "Loading..."

)