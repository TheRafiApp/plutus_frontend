/**
 * main.js
 */

require([
  'app',
  'router',
  'sockets/ws-client-amd',
  'model/session/SessionModel',
  'view/AlertView',
  'view/tips/RefreshView',
  'view/modals/ModalDialogView',
  'view/modals/ModalConfirmView',
  'https://cdn.ravenjs.com/3.9.1/raven.min.js'
],
function(
  app,
  Router,
  SocketClient,
  SessionModel,
  AlertView,
  RefreshView,
  ModalDialogView,
  ModalConfirmView,
  Raven
){
  try {
    console.log('checking for ls support');
    localStorage.setItem('_test', '123');
    localStorage.removeItem('_test');
  } catch(error) {
    console.warn(error)
    alert('It looks like you are in private browsing mode, which is not supported. Please disable private browsing to continue.');
    // throw error;
    return false;
  }

  // Create client session
  app.session = new SessionModel();

  // Init router
  app.router = new Router();

  // Init websockets
  _.extend(app, {
    ws: {
      open_socket: function() {
        var self = this;

        this.socket = new SocketClient(app.url.sockets_url);

        this.socket.on('message', function(data) {
          if (self.reconnecting) {
            clearInterval(self.reconnecting);
            self.reconnecting = 0;
          }

          app.controls.handleMessage(data);
        });

        this.socket.on('close', function() {
          if (!self.reconnecting) {
            self.reconnecting = setInterval(function() {
              self.open_socket();
            }, 5000);
          }
        });

        this.socket.send({ 'connected': new Date() });
      },
    }
  });

  app.ws.open_socket();

  // Init router/session dependent App methods
  _.extend(app, {

    // App Alerts
    alerts: {
      display: function(_type, _message) {
        var alert = new AlertView({
          type: _type,
          message: _message
        });

        $('.alerts').append(alert.$el);

        return this;
      },
      dismiss: function() {
        if (app.views.alertView)
          app.views.alertView.closeAlert();

        return this;
      },
      success: function(_message) {
        this.display('success', _message);
        return this;
      },

      warn: function(_message) {
        this.display('warn', _message);
        return this;
      },

      error: function(_message) {
        this.display('error', _message);
        return this;
      }
    },

    // Methods for manipulating views
    controls: {

      // Login
      login: function(_data, _response) {
        var request = app.session.login({
          data: _data
        });

        request.then(function(response) {
          app.router.loaded = true;
          app.session.updateSessionUser( response || {} );
          app.session.set('logged_in', true);

          // if user was trying to access a page but had to log in first,
          // show them that content now
          var path = app.session.referer || 'dashboard';

          app.router.navigate(path, { trigger: true, replace: true });

          if (_response) app.alerts.success('Successfully logged in!');

        }).fail(function(error) {
          var message = error.responseJSON && error.responseJSON.message;

          app.controls.handleError(error, message);
        });

        return request;
      },

      // Logout
      logout: function() {
        app.controls.loadLock(true);
        var promise = app.session.logout();

        promise.always(function(response) {
          // successfully logged out
          app.session.set('logged_in', false);
          app.controls.loadLock(false);
        }).fail(function(error) {
          app.controls.handleError(error);
        });

        return promise;
      },

      wait: function(duration) {
        var promise = $.Deferred();

        var timeout = setTimeout(function() {
          clearTimeout(timeout);
          return promise.resolve();
        }, duration);
        return promise;
      },

      // Basic confirmation modal
      modalConfirm: function(_message, _eventName, _context, _options) {
        this.modal = new ModalDialogView({
          model: {
            message: _message
          },
          context: _context,
          eventName: _eventName,
          options: _options,
          app: app // for some reason the module cant access app normally...
        }).render();

        return this.modal;
      },

    /**
     * [modal for confirming with a password]
     *
     * @param  {string} _message          [Message to display (current unused)]
     * @param  {Backbone.View} _context   [view that created the modal]
     * @param  {string} _method           [method to run upon confirming]
     *
     *
     * @param  {object} _data             [optional: data that is dependent]
     * @return {Backbone.View}            [description]
     */
      modalHardConfirm: function(_message, _context, _method, _data) {
        this.modal = new ModalConfirmView({
          message: _message,
          context: _context,
          method: _method,
          data: _data,
          app: app // for some reason the module cant access app normally...
        }).render();

        return this.modal;
      },

      /**
       * [Display field error or errors]
       * @param  {[array/object]} fields [either an object with element and error or an object array]
       */

      renderPasswordFields: function(view) {
        var $password_fields = view.$el.find('input[type="password"]');

        $.each($password_fields, function(index, password_field) {
          var $wrapper = $('<div class="pw-container"></div>');
          var $btn = $('<div href="#" class="pw-toggle"></div>');
          $(password_field).wrap($wrapper).after($btn);

          $btn.on('click', function(e) {
            if ($(password_field).hasClass('password-visible')) {
              $(password_field).removeClass('password-visible').attr('type', 'password');
            } else {
              $(password_field).addClass('password-visible').attr('type', 'text');
            }
          });
        });
      },

      // check if the user has any microdeposits pending
      checkMicrodeposits: function(_user) {
        var user = _user || app.session.user;
        var funding_sources = user.get('dwolla_account.funding_sources');
        var funding_sources_with_md = [];

        for (var id in funding_sources) {
          if (funding_sources[id].microdeposits)
            funding_sources_with_md.push(id);
        }

        if (funding_sources_with_md.length)
          this.showMicrodepositsReminder(funding_sources_with_md);
      },

      // show popup to remind about microdeposits
      showMicrodepositsReminder: function(fs_array) {
        console.log(fs_array)

        // var ModalView = this.loader.loadView.get('ModalDialogView');

        // new ModalView({
        //   options: {
        //     cancel: false
        //   }
        // });
      },

      // render error messages on a field
      fieldError: function(fields) {
        if (fields.constructor == Array) {
          fields.forEach(function(field) {
            app.controls.renderError(field);
          });
        } else if (fields.constructor == Object) {
          app.controls.renderError(fields);
        }
        return this;
      },

      // dom handling for above method
      renderError: function(field) {
        var type = field.error ? 'error' : 'message';
        var message = field[type];

        var $el = $(field.element)
            .closest('.field-group')
            .addClass('has-' + type)
            .find('.help-text')
            .html(message);

            console.log($el, message)
        return this;
      },

      // Detect if companies collection needs to be fetched and render
      fetchAll: function(view, _toFetch) {
        view.companies = false;

        var promise = $.Deferred();
        var toFetchSuperadmin = [app.collections.companies];

        // add companies collection to superadmin
        if (_toFetch && _toFetch.superadmin) _.extend(toFetchSuperadmin, _toFetch.superadmin);

        var toFetch = _toFetch || {};
        toFetch.superadmin = toFetchSuperadmin;

        var role = app.session.get('user_role');
        var toFetchRole = toFetch[role] || [];

        if (toFetch['*']) toFetchRole = toFetchRole.concat(toFetch['*']);

        if (!toFetchRole) return promise.resolve();

        var quantity = toFetchRole.length;
        var promises = app.utils.promises(quantity);

        _.each(toFetchRole, function(collection, index) {
          collection.fetch().then(function(response) {
            promises[index].resolve();
          }).fail(function(error) {
            app.controls.handleError(error);
          });
        });

        $.when.apply($, promises).then(function() {
          promise.resolve();
        });

        return promise;
      },

      // toggle loading screen
      loadLock: function(boolean) {
        if (boolean === true) {
          this.appendLoader();
        } else if (boolean === false) {
          this.removeLoader();
        } else if (boolean === undefined) {
          var $loader;
          $loader = document.querySelector('.full-page.loading');
          if ($loader) {
            this.removeLoader();
          } else {
            this.appendLoader();
          }
        }
        return this;
      },

      // append loading screen
      appendLoader: function() {
        var $loader = document.createElement('div');
        $loader.className = 'full-page loading';
        document.body.appendChild($loader);
      },

      // remove loading screen
      removeLoader: function() {
        var $loader = document.querySelector('.full-page.loading');
        $loader.remove();
      },

      // lock screen and tell user to refresh
      requireRefresh: function() {
        var refreshView = new RefreshView();
        $('body').append(refreshView.$el);
      },

      // Decide what to do with websockets message data
      handleMessage: function(_data) {
        var data = JSON.parse(_data);
        if (data.event === 'deployment')
          if (data.refresh === true)
            this.requireRefresh();
      },

      // Decide what to do with an error response from server
      handleError: function(error, message, context, method) {

        // Server returned a 404, display notfound message
        if (error.status == 404) {
          app.alerts.error(message || 'Something went wrong...');

        // Dwolla API error
        } else if (['dwolla_api_error', 'dwolla_api_communication_error'].contains(error.responseJSON.error)) {
          app.alerts.error('It looks like our payment processor is experiencing problems');

        // Duplicate key error
        // } else if (error.responseJSON.error == 'pymongo_duplicate_key_error') {
          // do stuff

        // Server returned a 401, show password confirm modal
        } else if (error.responseJSON.error == 'dependency_error') {
          app.controls.modalHardConfirm('Please confirm your password', context, method, error.responseJSON.data);

        // Server returned a hard 500, just apologize lol
        } else if (error.responseJSON.error == 'server_error') {
          app.alerts.error(message || 'Something went wrong...');
          if (app.config.console) console.error(error);

        // Server returned a soft 500, display server error message
        } else if (error.responseJSON && error.responseJSON.message) {
          app.alerts.error(error.responseJSON.message);

        // Server returned a super hard 500, just apologize
        } else {
          app.alerts.error(message || 'Something went wrong...');
          if (app.config.console) console.error(error);
          if (app.config.bug_reporting) Raven.captureException(error);
        }
      },

      reportError: function(error, showDialogue) {
        Raven.captureException(error);
        if (showDialogue) Raven.showReportDialog();
      },

      // Auto resize textarea
      smartTextarea: function(context) {
        var $textarea = context.$el.find('textarea');

        if ($textarea.length === 0) return;

        $textarea.attr('data-size', $textarea[0].scrollHeight);

        $textarea.on('keyup keydown', function() {
          var $this = $(this);

          if ($this.val() === '') {
            $this.css({
              height: '33px'
            });
          } else {
            if ($this.attr('data-size') !== $this[0].scrollHeight) {
              $this.css({
                height: $this[0].scrollHeight
              });
              $this.attr('data-size', $this[0].scrollHeight);
            }
          }
        });
        return $textarea;
      },

      // Shake a modal for negative feedback
      modalShake: function(view) {
        // if it's a modal, run shake animation
        var $modal = view.$el.find('.modal');
        if ($modal.length > 0) {
          $modal.addClass('shake');

          // using timeout because on transitionEnd wasn't reliable
          var delay = setTimeout(function() {
            $modal.removeClass('shake');
            clearTimeout(delay);
          }, 600);
        }
        return this;
      },

      // Money mask
      maskMoney: function(selector, context, chars) {
        if (typeof chars == 'undefined') chars = 7; // 7 chars allows for 5000.00
        var string = new Array(chars + 1).join('z');
        var $money = context.$el.find(selector);
        $money.mask(string, {
          translation: {
            'z': {
              pattern: /[0-9\.]/
            }
          }
        });
        $money.on('change', function(e) {
          var $target = $(e.target);
          var value = $target.val();
          var invalid = app.utils.validateMoney(value);
          if (invalid) {
            app.controls.fieldError({
              element: $target,
              error: 'Please enter a valid amount'
            });
          } else {
            // if there is a decimal, remove if it's 0, or make it its 2 digits
            if ($target.val().contains('.')) {
              if ($target.val().slice(-3) == '.00') {
                $target.val($target.val().slice(0, -3));
              } else if ($target.val().slice(-2) == '.0') {
                $target.val($target.val().slice(0, -2));
              } else if ($target.val().split('.')[1].length === 1) {
                $target.val($target.val() + '0');
              }
            }
          }
        });
        return $money;
      },

      // Hide tertiary panel
      hideTertiary: function() {
        var self = this;

        if (this.hidingTertiary) return;
        // Get route and navigate there
        var route = app.router.getRoute();
        app.router.navigate(route, { trigger: false });
        app.router.trigger('route');

        // Remove highlight from row
        $('.row.selected').removeClass('selected');

        this.hidingTertiary = true;

        // Animate and then close view
        $('body').addClass('tertiary-hidden').one(app.utils.transitionEvent, function() {
          var view = app.views.modelView || app.views.unitsView;
          view.close();

          delete app.views.modelView;
          delete app.views.unitsView;
          delete app.views.currentView.selected;
          delete self.hidingTertiary;
        });

        if (app.views.unitView) this.hideQuarternary({
          trigger: true
        });

        return this;
      },

      // Hide quarternary panel
      hideQuarternary: function(options) {
        var self = this;

        if (this.hidingQuarternary) return;

        if (options && options.trigger) {
          // Get route and navigate there
          var route = app.router.getPath().split('/');
          route.pop();
          route = route.join('/');
          app.router.navigate(route, { trigger: false });
          app.router.trigger('route');
        }

        // Remove highlight from row
        $('.tertiary .row.selected').removeClass('selected');

        app.views.unitView.$el.removeClass('active');

        this.hidingQuarternary = true;

        // Animate and then close view
        $('body').addClass('quarternary-hidden').one(app.utils.transitionEvent, function() {
          if (app.views.unitView) app.views.unitView.close();
          delete app.views.unitView;
          delete app.views.currentView.selected;
          delete self.hidingQuarternary;
        });

        return this;
      }
    }
  });

  // HTML5 pushState support shim

  var hasPushstate = !!(window.history && history.pushState);

  if (hasPushstate) {
    Backbone.history.start({
      pushState: true,
      root: app.url.base_path
    });
  } else {
    Backbone.history.start();
  }

  // Debug menu
  // console.log('debug: ' + app.config.debug)
  if (app.config.debug) {
    app.utils.loadView.get('DebugView').then(function(DebugView) {
      app.views.debugView = new DebugView();
    });
  }

  // Bugherd for feedback
  if (app.config.bugherd) {
    var bh = document.createElement('script'), s = document.getElementsByTagName('script')[0];
    bh.type = 'text/javascript';
    bh.src = 'https://www.bugherd.com/sidebarv2.js?apikey=' + app.config.bugherd_key;
    s.parentNode.insertBefore(bh, s);
  }

  // Raven.js (Sentry) for error logging
  if (app.config.sentry) {
    Raven.config(app.config.sentry_dsn, {
      ignoreUrls: [
        /10.1.10.38:8888/,
        /staging.payment.rafiproperties.com/,
        /payment.rafiproperties.com/
      ]
    }).install();
  }


  // Catch all front end errors and collect feeback
  window.onerror = function(msg, url, lineNo, columnNo, error) {
    if (app.config.sentry) {
      Raven.captureException(error);
      Raven.showReportDialog();
    }
  };

  // Global event delegation

  $(document)
    // Catch server errors and collect feedback
    .ajaxError(function(event, xhr, options) {
      if (app.config.xhr_error_reporting) {
        if (xhr.status === 500) {
          if (xhr.responseJSON && xhr.responseJSON.event_id) {
            Raven.showReportDialog({
              eventId: xhr.responseJSON.event_id,
              dsn: xhr.responseJSON.public_dsn
            });
          }
        }
      }
    })

    // Intercept relative links and trigger route
    .on('click', 'a[href^="/"]:not([data-bypass])', function(event) {
      event.preventDefault();
      var url = $(this).attr('href');
      app.router.navigate(url, { trigger: true, replace: false });
    })

    // Prevent links with # href from default browser action
    .on('click', 'a[href="#"]:not([data-bypass])', function(event) {
      event.preventDefault();
    })

    // Toggle nav
    .on('click', '.action-toggle-nav', function(event) {
      $(this).toggleClass('active');
      $('nav').toggleClass('active');
    })

    // Hide error messages on input keyup
    .on('keyup', '.has-error input', function() {
      $(this).closest('.field-group').removeClass('has-error');
      $(this).closest('.help-text').text('');
    })

    // Hide error messages on change for non text inputs
    .on('change', '.has-error input', function() {
      // make sure input is correct type
      if ($(this).hasClass('chosen')) return;
      $(this).closest('.field-group').removeClass('has-error');
      $(this).closest('.help-text').text('');
    })

    // Hide error messages on change for non text inputs
    .on('change', '.has-error select', function() {
      // make sure input is correct type
      $(this).closest('.field-group').removeClass('has-error');
      $(this).closest('.help-text').text('');
    })

    // Hide error messages for chosen fields
    .on('click', '.has-error .chosen-container', function() {
      $(this).closest('.field-group').removeClass('has-error');
      $(this).closest('.help-text').text('');
    })

    // Focus chaining on single char inputs
    .on('keyup', '.focus-chain', function(event) {
      var key = String.fromCharCode(event.which);
      var regex;

      if ($(this).hasClass('numbers-only')) {
        regex = /\d/;
      } else if ($(this).hasClass('letters-only')) {
        regex = /[a-z]/i;
      } else {
        regex = /[a-z]\d/i;
      }

      if (!key.match(regex)) return;

      if ($(this).attr('maxlength') && $(this).val().length < $(this).attr('maxlength')) return;

      var $all = $('.focus-chain'),
          length = $all.length,
          index = $all.index($(this));

      if (++index === length) return;

      $all[index].focus();
    })
    // Close Jasmine tests
    .on('click', '.jasmine-version', function(event) {
      event.preventDefault();
      $(this).closest('.jasmine_html-reporter').removeClass('visible');
    });


  // Load Google APIs
  var googleUrl = [
    'async!',
    'https://maps.googleapis.com/maps/api/js?key=',
    app.config.google_places_key,
    '&libraries=places',
    '&callback=initService'
  ].join('');

  app.utils.load.get(googleUrl);


  // Override Backbone.ajax to check for expired tokens
  Backbone.ajax = function() {
    var xhr = arguments;
    var request = Backbone.$.ajax.apply(Backbone.$, xhr);
    var promise = $.Deferred();

    request.always(function(_data, _message, _response) {
      if (app.session.tokens.pass) delete app.session.tokens.pass;

      // TODO: refactor
      if (_response && _response.responseJSON) {
        if (_response.responseJSON.error == 'token_expired') {
          app.session.refreshTokens().then(function() {
            Backbone.$.ajax.apply(Backbone.$, xhr).then(function(_data, _message, _response) {
              return request.resolve(_data, _message, _response);
            }, function(error) {
              return request.reject(error);
            });
          });
        } else {
          return request.resolve(_data, _message, _response);
        }
      }
    }).fail(function(error) {
      return request.reject(error);
    });

    _.extend(request, promise); // overwrite the original promise XD

    return request;
  };

});
