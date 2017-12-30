App.Models.Message = Backbone.Model.extend({

  defaults() {
    return {
      message: '',
      type: 'info',
      closed: false
    };
  },

  initialize() {}

});