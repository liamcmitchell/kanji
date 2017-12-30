App.Routers.Main = Backbone.Router.extend({

  routes: { 
    ""                : "test",
    "settings"        : "settings",
    "*splat"          : "defaultRoute"
  },

  // Helper function to cache singleton views and pass to main view
  show(view) {
    return App.main.content.show(new (App.Views[view]));
  },

  test() {
    return this.show('Tester');
  },

  settings() {
    return this.show('Settings');
  },

  defaultRoute(splat) {
    // Redirect all other paths to root
    return this.navigate("", true);
  }

});