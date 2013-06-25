App.Views.Tester = Backbone.View.extend(

  id: "tester"
  
  initialize: ->

    @user = App.user
    @tests = App.tests

    @currentView = @next()
    @$el.html @currentView.$el

    # Set up keyboard listeners
    $(document).bind 'keydown.1', => @$el.find('.options > div:eq(0)').trigger('click')
    $(document).bind 'keydown.2', => @$el.find('.options > div:eq(1)').trigger('click')
    $(document).bind 'keydown.3', => @$el.find('.options > div:eq(2)').trigger('click')
    $(document).bind 'keydown.4', => @$el.find('.options > div:eq(3)').trigger('click')

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
        @listenTo @user, 'change', ->
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