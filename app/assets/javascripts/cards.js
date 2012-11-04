// Card model
App.Card = Backbone.Model.extend({
  urlRoot: '/cards',
  
  defaults: function() {
    return {
      revisions: 0
    };
  },

  initialize: function() {
    this.kanji = this.get('kanji');
    this.resetTests();
    this.on('change', function(){
      if (App.currentUser.isSignedIn()) {
        console.log('Updating card');
        this.save();
      }
    });
  },

  completedTest: function(type) {
    this.tests[type.id] -= 1;

    // If card has been correctly tested enough
    if (this.remainingTests().length == 0) {
      // Increment revisions by one
      this.set('revisions', this.get('revisions') + 1);
      this.resetTests();
      
      // Update card sets
      App.testingCardSet.remove(this);
      App.learntCardSet.add(this);
      App.testingCardSet.update();

    }
  },

  resetTests: function() {
    this.tests = {};
    var tests = this.tests;
    _.each(App.testTypes, function(type){
      tests[type.id] = type.times;
    });
  },

  // return array of tests not yet completed
  remainingTests: function() {
    var card = this;
    return _.filter(App.testTypes, function(type){
      return (card.canTest(type) && card.tests[type.id] > 0);
    });
  },

  // checks if test can be applied to card
  canTest: function(test) {
    return (this.hasAttr(test.question) && this.hasAttr(test.answer));
  },
  
  // checks if kanji has property
  hasAttr: function(attr) {
    if (attr == 'reading') {
      return (this.hasAttr('onyomi') || this.hasAttr('kunyomi'));
    }
    return (this.kanji.hasOwnProperty(attr) && this.kanji[attr]);
  }

});

App.CardSet = Backbone.Collection.extend({
  model: App.Card,

  // return random set of specified length
  random: function(num) {
    result = new App.CardSet;

    if (this.length == 0) return result;

    if (!num) num = 1;
    if (num > this.length) num = this.length;

    var picked = [];
    while (result.length < num) {
      i = Math.floor((Math.random()*this.length));
      if (_.lastIndexOf(picked, i) == -1) {
        picked.push(i);
        result.add(this.at(i));
      }
    }
    return result;
  },

  // update card set from server (only intended for App.testingCardSet)
  update: function(callback) {
  
    if (this.length >= App.options.testingCardSetSize) return true;
    
    var cardSet = this;
    $.ajax({
      url: '/cards/next',
      type: 'POST',
      data: {
        level: App.currentUser.level(),
        limit: App.options.testingCardSetSize - cardSet.length,
        card_not_in: cardSet.pluck('id'),
        kanji_not_in: _.pluck(cardSet.pluck('kanji'), 'id')
      }
    }).done(function(data) {
      cardSet.add(data);
      console.log('Fetched ' + data.length + ' card(s)');
      // TODO alert user if they are running out of cards?
      if (typeof(callback) == 'function') callback();
    });
  }
});

App.CardView = Backbone.View.extend({
  className: 'card box',
  initialize: function(){
    this.render();
  },
  render: function(){
    // prepare variables
    var kanji = this.model.kanji;
    var kunyomi = kanji.kunyomi.split(', ');
    for (var i = 0; i < kunyomi.length; i++) {
      if (kunyomi[i].search(/\./) > 0) {
        var pieces = kunyomi[i].split('.');
        kunyomi[i] =  pieces[0] + '<span class="not-reading">' + pieces[1] + '</span>';
      }
    }

    var variables = {
      literal: kanji.literal,
      meaning: kanji.meaning,
      onyomi: kanji.onyomi,
      kunyomi: kunyomi
    };

    var template = _.template( $("#card-template").html(), variables );

    this.$el.html( template );
  },
  show: function(c) {
    var all = 'literal meaning reading';
    if (c == 'all') c = all;
    this.$el.removeClass(all).addClass(c);
    return this; // for chaining
  }
});
