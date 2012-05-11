// Test model
App.Test = Backbone.Model.extend({

  defaults: function() {
    return {};
  },

  initialize: function() {

    // choose from available cards
    this.cards = App.testingCardSet.random(4);
    this.card = this.cards.random().at(0);

    // make sure card is different from previous test
    while (this.card == App.previousCard) {
      this.card = this.cards.random().at(0);
    }
    App.previousCard = this.card;

    // choose type of test
    this.type = _.first(_.shuffle(this.card.remainingTests()));

    // blank result to start
    this.result = null;
  },

  correct: function() {
    if (this.result == null) {
      this.result = 'correct';
      this.card.correct(this.type);
    }
  },

  fail: function() {
    if (this.result == null) {
      this.result = 'incorrect';
      this.card.resetTests();
    }
  }

});

App.Tests = Backbone.Collection.extend({
  model: App.Test
});

App.TestView = Backbone.View.extend({
  className: 'test',
  initialize: function(){
    var v = this;
    v.render();

    // add question card
    v.questionCard = new App.CardView({model: v.model.card}).show(v.model.type.question);
    v.$el.find('.question').append( v.questionCard.$el );
    // add option cards
    v.optionCards = [];
    v.model.cards.each(function(value){
      var option = new App.CardView({model: value, test: v}).show(v.model.type.answer);
      v.optionCards.push(option);
      v.$el.find('.options').append( option.$el );
    });
  },
  render: function(){
    this.$el.html( _.template( $('#test-template').html() ) );
  },
  events: {

  },
  // check sent from option card
  correct: function(cardView) {
    if (cardView.model == this.model.card) {
      this.model.correct();
      // make a new test
      App.previousTests.add(App.currentTest);
      App.currentTest = new App.Test;
      // continue to next test after delay
      setTimeout(App.test, App.options.speed);
      return true;
    }
    else {
      this.model.fail();
      return false;
    }
  }
});
