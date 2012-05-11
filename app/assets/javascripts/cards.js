// Card model
App.Card = Backbone.Model.extend({

  defaults: function() {
    return {
      revisions: 0
    };
  },

  initialize: function() {
    this.kanji = this.get('kanji');
    this.resetTests();
  },

  correct: function(test) {
    this.tests[test.id] += 1;

    // if card has been correctly tested enough
    if (this.remainingTests().length == 0) {
      // increment revisions by one
      this.set('revisions', this.get('revisions') + 1);
      this.resetTests();

      App.testingCardSet.remove(this);
      App.learntCardSet.add(this);

    }
  },

  resetTests: function() {
    this.tests = {};
    var tests = this.tests;
    _.each(App.testTypes, function(value){
      tests[value.id] = 0;
    });
  },

  // return array of tests not yet completed
  remainingTests: function() {
    var card = this;
    return _.filter(App.testTypes, function(value){
      return (card.canTest(value) && card.tests[value.id] < value.times);
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
    if (this.length >= App.options.testingCardSetSize) return false;
    var cardSet = this;
    $.ajax({
      url: '/cards/update',
      type: 'POST',
      data: {
        jlpt: App.currentUser.jlpt(),
        limit: App.options.testingCardSetSize - cardSet.length,
        card_not_in: cardSet.pluck('id'),
        kanji_not_in: 1 // TODO
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
  events: {
    'click': 'click'
  },
  click: function(e) {
    // if it's part of a test, check result
    if (this.options.test) {
      if (this.options.test.correct(this)) {
        this.$el.addClass('correct');
      }
      else {
        this.$el.addClass('incorrect');
        this.show(this.options.test.model.type.question);
      }
    }
  },
  show: function(c) {
    var all = 'literal meaning reading';
    if (c == 'all') c = all;
    this.$el.removeClass(all).addClass(c);
    return this; // for chaining
  }
});
