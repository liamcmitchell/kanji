App.Views.Main = Backbone.View.extend(

  el: "#app"

  initialize: ->

    @render()

    # Frame view
    @content = new Backbone.View(el: "#content")

    # Set up keyboard listeners
    $(document).bind 'keydown.1', => @$el.find('.options > div:eq(0)').trigger('click')
    $(document).bind 'keydown.2', => @$el.find('.options > div:eq(1)').trigger('click')
    $(document).bind 'keydown.3', => @$el.find('.options > div:eq(2)').trigger('click')
    $(document).bind 'keydown.4', => @$el.find('.options > div:eq(3)').trigger('click')

  render: ->
    @$el.html HandlebarsTemplates['main'](
      isSignedIn: App.user.isSignedIn()
      name: App.user.get('name')
    )

)