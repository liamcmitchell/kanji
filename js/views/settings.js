App.Views.Settings = Backbone.View.extend({

  className: "settings",

  initialize() {
    return this.render();
  },

  render() {
    this.$el.html(Handlebars.compile($('#settings').html())({
      levels: App.levels
    })
    );
    return this.$(`option[value=${App.user.level()}]`).attr('selected', 'selected');
  },

  events: {
    'submit form'(event) {
      event.preventDefault();
      return this.update();
    },
    'change input, textarea, select': 'update'
  },

  update() {
    App.user.level(this.$el.find('select[name=level]').val());
    return App.message("Updated.");
  }

});