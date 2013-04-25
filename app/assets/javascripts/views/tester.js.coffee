App.Views.Tester = Backbone.View.extend(

  id: "tester"
  
  initialize: ->

    @user = App.user
    @tests = App.tests

    @currentView = @next()
    @$el.html @currentView.$el

  # Returns view to display
  next: ->

    # If we have a test, show it
    if test = @tests.next()
      
      # Set callback to show next test once completed
      @listenTo test, "completed", ->
        @stopListening test
        @show @next()

      new App.Views.Test(model: test)

    # Else test couldn't be made
    else
      # If level is not set, prompt for it
      if !@user.level()
        @listenTo @user, 'change:settings', ->
          @stopListening @user
          @show @next()
        new App.Views.Level()

      # Else we are waiting for cards to load
      else
        @listenTo @user.cards, "add", ->
          @stopListening @user.cards
          @show @next()
        new App.Views.Loading()

)