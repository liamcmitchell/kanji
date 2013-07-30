App.Views.Main = Backbone.View.extend(

  el: "#app"

  initialize: ->

    @render()

    # Messages holder
    @messagesView = new App.Views.Messages(model: App.messages)

    # Learnt cards
    @learntView = new App.Views.Learnt(model: App.user.cards)

    # Frame view
    @content = new Backbone.View(el: "#content")

    @content.on('all', ->
      console.log arguments
    )

  render: ->
    @$el.html HandlebarsTemplates['main'](
      isSignedIn: App.user.isSignedIn()
      name: App.user.get('name')
    )

)