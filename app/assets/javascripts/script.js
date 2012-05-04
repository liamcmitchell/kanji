// TODO CLEAN THIS CRAP

// settings dialogue
App.settingsDialogue = function() {
  if (state == 'settings') return false;
  if (!App.currentUser.isSignedIn()) {
    signInDialogue();
    return false;
  }
  state = 'settings';
  d = $('<div class="dialogue" />');
  d.append(themeTitle('Settings'));
  d.append(themeBox('Multiple settings available here'));
  d.append(themeBox('Sign out', ['button']).click(function(){ App.currentUser.signOut(); }));
  d.append(themeBox('Back to learning!', ['button']).click(function(){ App.test(); }));
  canvasShow(d);
}

// sign in/create account form
App.signInDialogue = function() {
  if (state == 'signin') return false;
  state = 'signin';

  // make sure forms are reset
  $('input', $signin).removeAttr('disabled')
  $('[type=text], [type=password]', $signin).val('');
  $('input', $register).removeAttr('disabled')
  $('[type=text], [type=password]', $register).val('');

  d = $('<div class="dialogue" />');
  d.append(themeTitle('Sign in'));
  d.append(themeBox($signin));
  d.append(themeTitle('or create an account'));
  d.append(themeBox($register));
  d.append(themeBox('Actually, no thanks...', ['button']).click(function(){ App.test(); }));
  canvasShow(d);
};

// sign in submit handler
App.signInSubmit = function($form) {
  // remove errors from previous attempts
  $('.error', $form).remove();
  // submit form via ajax
  App.currentUser.signIn(
    $form.find('input[name=auth_key]').val(),
    $form.find('input[name=password]').val(),
    log,
    function(data, textStatus) {
      // if signed in
      if (data.uid) {
        App.currentUser.set(data);
      }
      // if sign in error
      else if (data === false) {
        App.log(arguments);
        $('#password', $form).val('');
        $('.actions', $form).append('<span class="error">Sign in failed</span>');
        $('input', $form).removeAttr('disabled');
      }
      else {
        App.log(arguments);
      }
    }
  );
  // disable so it can't be submitted twice
  $('input', $form).attr('disabled', 'disabled');
};

// theme a box div
App.themeBox = function(content, classes) {
  if (classes) classes = classes.join(' ');
  else classes = '';
  return $('<div class="box ' + classes + '"></div>').append(content);
};

// theme a title
App.themeTitle = function(content, classes) {
  if (classes) classes = classes.join(' ');
  else classes = '';
  return $('<h2 class="' + classes + '"></h2>').append(content);
};

// show new view on canvas
App.canvasShow = function(view) {
  App.wait = true;
  App.hide(App.$canvas, function(){
    App.$canvas.empty().html(view.$el);
    setTimeout(function(){
      App.wait = false;
      App.show(App.$canvas);
    }, App.options.speed);
  });
};

// hide animation
App.hide = function(object, callback) {
  object.css({position: 'relative'}).animate({opacity:0, left: '-100px'}, App.options.speed, 'swing', callback);
};

// show animation
App.show = function(object, callback) {
  object.css({position: 'relative', left: '100px'}).animate({opacity: 1, left: '0'}, App.options.speed, 'swing', callback);
};
