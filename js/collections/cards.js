App.Collections.Cards = Backbone.Collection.extend({

  model: App.Models.Card,

  localStorage: new Backbone.LocalStorage("cards"),

  initialize() {
    this.fetch()
  },

  // Return array of testable cards
  testable() {
    return this.filter(card => card.testable());
  },

  // Return array of tested cards
  tested() {
    return this.filter((card) => !card.testable());
  },

  check(level) {
    if (!level) return

    const required = App.options.testingCardsSize - this.testable().length
    if (required <= 0) return

    this.add(
      _.chain(KANJI)
        .where({jlpt: parseInt(level.slice(-1))})
        .pluck('literal')
        .difference(this.pluck("kanji"))
        .slice(0, required)
        .map((kanji) => ({kanji: kanji}))
        .value()
    );
  }

});
