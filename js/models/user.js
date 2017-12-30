App.Models.User = Backbone.Model.extend({
  initialize() {
    this.on("change", function() {
      return this.save();
    });

    this.cards = new App.Collections.Cards();
    this.checkCards();
    this.on("change", function() {
      return this.checkCards();
    });
    return this.cards.on("change", () => {
      return this.checkCards();
    });
  },

  // Make sure user has full set of cards.
  checkCards() {
    this.cards.check(this.level())
  },

  // Return level or set if provided.
  level(level) {
    let settings = this.settings();
    if (typeof (settings) !== "object") { settings = {}; }
    if (!settings.level) { settings.level = null; }
    if (level) {
      settings.level = level;
      this.settings(settings);
    }
    return settings.level;
  },

  // Return or set settings object.
  // Needed to call change event on set.
  settings(settings) {
    if (settings) {
      this.set("settings", settings);
      this.trigger('change');
    } else {
      settings = this.get("settings");
    }
    return settings;
  },

});

App.Collections.Users = Backbone.Collection.extend({
  model: App.Models.User,
  localStorage: new Backbone.LocalStorage("users"),
  initialize() {
    this.fetch()
  },
})
