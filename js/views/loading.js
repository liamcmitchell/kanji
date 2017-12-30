App.Views.Loading = Backbone.View.extend({

  className: "loading",

  initialize() {
    this.render();

    return this.on('show resize', function() {
      return this.center();
    });
  },

  render() {
    return this.$el.html("Loading...");
  }

});