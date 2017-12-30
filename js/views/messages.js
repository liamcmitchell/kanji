App.Views.Messages = Backbone.View.extend({

  el: '#messages',

  initialize() {
    this.children = [];
    this.adjust();
    return this.listenTo(this.model, 'add', function(message) {
      const view = new App.Views.Message({model: message});
      this.children.push(view);
      return this.$el.append(view.$el);
    });
  },

  adjust() {
    const left = ($(document).width() - this.$el.width()) / 2;
    return this.$el.css({left: left + 'px'});
  }

});
