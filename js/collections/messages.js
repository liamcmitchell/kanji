App.Collections.Messages = Backbone.Collection.extend({
  model: App.Models.Message,
  initialize() {
    return App.user.on('signed-out', () => {
      return this.reset();
    });
  }
});