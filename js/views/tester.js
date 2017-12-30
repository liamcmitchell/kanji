App.Views.Tester = Backbone.View.extend({

  id: "tester",

  initialize() {

    this.user = App.user;
    this.tests = App.tests;

    this.currentView = this.next();
    this.$el.html(this.currentView.$el);

    // Pass on events to children
    this.on("show", function() {
      return this.currentView.trigger("show");
    });

    this.on('resize', function() {
      return this.currentView.trigger('resize');
    });

    this.on("remove", function() {
      this.currentView.trigger("remove");
      return this.currentView.remove();
    });

    // Set up keyboard listeners
    $(document).bind('keydown.1', () => this.$el.find('.options > div:eq(0)').trigger('click'));
    $(document).bind('keydown.2', () => this.$el.find('.options > div:eq(1)').trigger('click'));
    $(document).bind('keydown.3', () => this.$el.find('.options > div:eq(2)').trigger('click'));
    return $(document).bind('keydown.4', () => this.$el.find('.options > div:eq(3)').trigger('click'));
  },

  // Returns view to display
  next() {

    // If we have a test, show it
    const test = this.tests.next();
    if (test) {
      // Set callback to show next test once completed
      this.listenTo(test, "completed", function() {
        this.stopListening(test);
        return this.show(this.next());
      });

      return new App.Views.Test({model: test});

    // Else test couldn't be made
    } else {
      // If level is not set, prompt for it
      if (!this.user.level()) {
        this.listenTo(this.user, 'change', function() {
          this.stopListening(this.user);
          return this.show(this.next());
        });
        return new App.Views.Level();

      // Else we are waiting for cards to load
      } else {
        return new App.Views.Loading();
      }
    }
  }

});