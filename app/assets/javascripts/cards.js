// Card model
var Card = Backbone.Model.extend({

  defaults: function() {
    return {
      revisions: 0
    };
  },

  initialize: function() {
    this.kanji = this.get('kanji');
  },

  // chooses test type from available types
  chooseTest: function(testTypes) {
    this.results = this.results || {};
    var results = this.results;
    var choices = [];
    _.each(testTypes, function(value){
      if (!results.hasOwnProperty(value.id)) results[value.id] = 0;
      // TODO check that each test can actually be tested
      if (results[value.id] < value.times) choices.push(value);
    });
    return _.first(_.shuffle(choices));
  },

  correctTest: function(testType) {
    this.results[testType.id] += 1;
  },

  failTest: function(testType) {
    this.results = {};
  },

  completedTests: function(testTypes) {
    var results = this.results;
    var completed = true;
    _.each(testTypes, function(value){
      if (results.hasOwnProperty(value.id) && results[value.id] < value.times) completed = false;
    });
    if (completed) {
      // increment revisions by one
      this.set('revisions', this.get('revisions') + 1);
      this.results = {};
      return true;
    }
  }

});

var CardSet = Backbone.Collection.extend({
  model: Card,
  random: function(num) {
    result = new CardSet;

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
  }
});
