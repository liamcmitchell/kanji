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
  
  check: function(answer) {
    var result = (answer == this.card);
    
    if (result == true) {
      this.trigger('completed correct');
      if (!this.result) this.result = 'correct';
      if (this.result == 'incorrect') this.card.resetTests();
      if (this.result == 'correct') this.card.completedTest(this.type);
    }
    else {
      this.trigger('incorrect');
      if (!this.result) this.result = 'incorrect'
    }
    
    return result;    
  }

});

App.Tests = Backbone.Collection.extend({
  model: App.Test
});

App.TesterView = Backbone.View.extend({
  className: 'tester',
  initialize: function(){
    // If test already exists, go back to it
    this.nextTest(App.currentTest);
  },
  render: function(){
    
  },
  nextTest: function(test) {
    var v = this;
    
    if (!test) {
    
      // Make new test if cards are available
      if (App.testingCardSet.length) {
        test = new App.Test;
      }
      else {        
        // Update cards (async)
        App.testingCardSet.update(function() {
          v.nextTest();
        });
        // Show loading screen
        v.$el.html( _.template( $('#test-loading').html() ) );
        return;
      }
    }
    
    if (test) {
      // Update currentTest
      App.currentTest = test;
      // Set callback to start next test once completed
      test.on("completed", function(){
        setTimeout(function(){ v.nextTest(); }, App.options.speed*2);
      });
      // Show test
      // TODO: only animate if replacing old test
      App.a.slide(v.$el, new App.TestView({model: test}).$el);
    }
    else {
      console.log('No test to display');
    }
  }
});

App.TestView = Backbone.View.extend({
  className: 'test',
  initialize: function(){
    this.render();
  },
  render: function(){
    var v = this;  // view
    var t = this.model; // test
    
    // load template
    v.$el.html( _.template( $('#test-template').html() ) );
    
    // add question card
    questionCard = new App.CardView({model: t.card}).show(t.type.question);
    v.$el.find('.question').append( questionCard.$el );
    
    // add option cards
    t.cards.each(function(card){
    
      var option = new App.CardView({model: card});
      
      // Show answer part of card
      option.show(t.type.answer);
      
      // Add listener for click
      option.$el.on('click', function(){
      
        // Check result and mark accordingly
        if (t.check(card) == true) {
          option.$el.addClass('correct');
        }
        else {
          option.$el.addClass('incorrect');
          option.show(t.type.question);
        }
        
      });

      // Add to dom
      v.$el.find('.options').append( option.$el );
    });
  }
});
