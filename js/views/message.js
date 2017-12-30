App.Views.Message = Backbone.View.extend({

  className: 'alert',

  initialize() {
    return this.render();
  },

  render() {
    this.$el.html(Handlebars.compile($('#message').html())({
      message: this.model.get("message")
    })
    );
    return this.$el.addClass(`alert-${this.model.get("type")}`);
  },

  events: {
    'click .close': 'close'
  },

  close() {
    this.model.set("closed", true);
    return this.remove();
  }

});
