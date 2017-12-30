App.Collections.Tests = Backbone.Collection.extend({
  model: App.Models.Test,

  // Return next test
  next() {
    if (this.current()) {
      return this.current();
    } else {
      return this.new();
    }
  },

  // Return latest incomplete test
  current() {
    return _.last(this.filter( test => test.result === null));
  },

  // Return new test or false if unable
  new() {
    // Need 4 cards
    const options = _.shuffle(App.user.cards.testable()).slice(0, 4);
    if (options.length === 4) {

      const test = new App.Models.Test({})

      test.options = options
      // Card shouldn't be the same as last time.
      test.card = _.shuffle(_.reject(options, c => { 
        if (this.last() && (c === this.last().card)) { return true; }
      }))[0];
      test.type = _.first(_.shuffle(test.card.remainingTests()));

      // Add to collection
      this.add(test);

      return test

    } else {
      return false;
    }
  }
});