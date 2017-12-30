// Card model
App.Models.Card = Backbone.Model.extend({
  defaults() {
    return {revisions: 0};
  },

  initialize() {
    this.kanji = _.findWhere(KANJI, {literal: this.get("kanji")});
    this.resetTests();
    return this.on("add change", function() {
      return this.save();
    });
  },

  testable() {
    const revisions = this.get('revisions')
    const lastTested = this.get('lastTested') || 0
    const now = Date.now()
    const hours = 1000 * 60 * 60
    const days = 24 * hours
    const months = 30 * days

    return revisions === 0 ||
      (revisions === 1 && lastTested < now - 12 * hours) ||
      (revisions === 1 && lastTested < now - 36 * hours) ||
      (revisions === 1 && lastTested < now - 7 * days) ||
      (revisions === 1 && lastTested < now - 1 * months) ||
      (revisions === 1 && lastTested < now - 4 * months)
  },

  completedTest(type) {
    // Reduce test count
    this.tests[type.id] -= 1;

    // If card has been correctly tested enough
    if (this.remainingTests().length <= 0) {
      this.resetTests()
      return this.set({
        revisions: this.get("revisions") + 1,
        lastTested: Date.now(),
      })
    }
  },

  // Populate the required test counts
  resetTests() {
    this.tests = {};
    return _.each(App.testTypes, type => {
      return this.tests[type.id] = type.times;
    });
  },

  // Return array of tests not yet completed
  remainingTests() {
    return App.testTypes.filter(type => {
      return this.canTest(type) && (this.tests[type.id] > 0);
    });
  },

  // Checks if test can be applied to card
  canTest(test) {
    return this.hasAttr(test.question) && this.hasAttr(test.answer);
  },

  // Checks if kanji has property
  hasAttr(attr) {
    if (attr === "reading") {
      return (this.hasAttr("onyomi") || this.hasAttr("kunyomi"));  
    } else {
      return this.kanji.hasOwnProperty(attr) && this.kanji[attr];
    }
  }

});