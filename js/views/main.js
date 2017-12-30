App.Views.Main = Backbone.View.extend({

  el: "#app",

  initialize() {

    this.render();

    // Messages holder
    this.messagesView = new App.Views.Messages({model: App.messages});

    // Learnt cards
    this.learntView = new App.Views.Learnt({model: App.user.cards});

    // Frame view
    this.content = new Backbone.View({el: "#content"});

    // Send resize event to children
    return $(window).resize(() => {
      return this.content.currentView.trigger('resize');
    });
  },

  render() {
    return this.$el.html(Handlebars.compile($('#main').html())({
      name: App.user.get('name')
    }));
  }

});