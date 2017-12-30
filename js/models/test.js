App.Models.Test = Backbone.Model.extend({

  initialize() {    
    this.result = null;

    return this.on("completed", function() {
      if (this.result === "correct") {
        return this.card.completedTest(this.type);
      } else {
        return this.card.resetTests();
      }
    });
  },

  check(answer) {
    if (answer === this.card) {
      if (!this.result) { this.result = "correct"; }
      this.trigger("completed");
      return true;
    } else {
      if (!this.result) { this.result = "incorrect"; }
      return false;
    }
  }
});