App.Views.Learnt = Backbone.View.extend({

  el: '#learnt',

  initialize() {
    this.render();
    return this.listenTo(this.model, 'change', function() {
      return this.render();
    });
  },

  render() {
    const learnt = [];
    _.each(this.model.tested(), card => learnt.push(card.kanji.literal));

    return this.$el.html(learnt.reverse().join(" "));
  }

});
