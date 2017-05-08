/**
 * app.js
 */

define([
  'env-config',
  'vendor/loader',
  'model/AppModel',
  'collection/AppCollection',
  'view/tips/TipsView',
  'text!templates/logo.html'
],
function(
  config, 
  Loader, 
  AppModel, 
  AppCollection, 
  TipsView, 
  LogoTemplate
) {

  var app = {};

  // Extend default app config with env
  app.config = _.extend({
    bugherd: false,
    sentry: false,
    debug: false,
    console: true,
    bug_reporting: false
  }, config);

  // App core object
  _.extend(app, {
    version: '0.1.1',

    // Important URLs for App
    url: {
      host: location.host,
      origin: location.origin,
      protocol: location.protocol,

      base_url: app.config.base_url,
      base_path: app.config.base_path,

      sockets_url: app.config.sockets_url,

      query_string: function() {
        return window.location.search.slice(1).split('&')[0]; // no params
      }
    },

    // either return what is in localStorage or a default
    API: function() {
      var stashed = this.utils.stash.getItem('API');
      if (stashed && this.config.debug) {
        return stashed;
      } else {
        return app.config.API;
      }
    },

    // Core classes
    Model: AppModel,
    Collection: AppCollection,
    View: {
      TipsView: TipsView
    },

    // For storing instances
    views: {},
    collections: {},
    models: {},
    templates: {
      logo: _.template(LogoTemplate)
    },

    // Data schema
    schema: {

      /**
       * Process form data, check if schema has types
       *
       * @param  {[object]} data      [form data to be parsed]
       * @return {[Backbone.Model]}   [model to check schema]
       */

      process: function(data, model, schema_level) {
        var self = this;
        var schema = schema_level || model.schema;
        // console.log(data, model.schema)

        if (!schema) return data;

        data = app.utils.trim(data);

        var formatted = _.extend({}, data);

        // console.log(data, schema);

        for (var attr in data) {
          if (attr in schema) {

            // if its an array, apply schema formatting for each entry
            if (Array.isArray(schema[attr])) {
              formatted[attr] = formatted[attr].map(function(a) {
                return self.process(a, model, schema[attr][0]);
              });

            // if it's an object and a type is specified, just apply it once
            } else if (schema[attr].type) {
              // console.log('type: ' + schema[attr].type);
              try {
                formatted[attr] = app.schema.format[schema[attr].type](formatted[attr], formatted);
              } catch(error) {
                console.warn(error);
                return false;
                // throw error;
                // console.warn('Invalid type: ' + schema[attr].type, error);
              }

            // or if no type specified, go a level deeper
            } else {
              formatted[attr] = this.process(data[attr], model, schema[attr]);
            }
          }
        }

        // console.log(data, formatted);

        return formatted;

      },

      format: {
        dob: function(data, obj) {
          var date_array = [
            obj.dob_month,
            obj.dob_day,
            obj.dob_year
          ];

          if (date_array.some(function(date_component) {
            return date_component === undefined;
          })) {
            throw new TypeError('Incomplete date');
          }

          var date_string = date_array.join(', ');
          var formatted = moment.utc(date_string).format('YYYY-MM-DD');

          obj.dateOfBirth = formatted;

          return data;
        },

        // address: function(data, obj) {
        //   var address_array = data.split(', ');
        //   var state_zip = address_array[2].split(' ');
        //   obj.city = address_array[1];
        //   obj.state = state_zip[0];
        //   obj.zip = state_zip[1];
        //   obj.country = address_array[3];

        //   return address_array[0];
        // },

        phone: function(data) {
          var phone_data = app.utils.uglyPhone(data) || data; // hack to make sure data gets validated
          // if (!phone_data) throw new TypeError('Invalid phone number input');

          return phone_data;
        },

        money: function(data) {
          var money_data = app.utils.parseMoney(data);
          if (app.utils.validateMoney(money_data)) throw new TypeError('Invalid currency amount');

          return parseFloat(money_data);
        },

        money_or_zero: function(data) {
          var money_data = app.utils.parseMoney(data);
          if (app.utils.validateMoney(money_data, null, null, true)) throw new TypeError('Invalid currency amount');

          return parseFloat(money_data);
        },

        charge: function(data, obj) {
          var money_data = app.utils.parseMoney(data);

          if (app.utils.validateMoney(money_data)) throw new TypeError('Invalid charge amount');

          if (['first_month', 'last_month', 'credit'].contains(obj.type)) {
            money_data = -Math.abs(money_data);

          } else if (['rent', 'fee'].contains(obj.type)) {
            money_data = Math.abs(money_data);
          }

          return parseFloat(money_data);
        },

        transfer: function(data, obj) {
          var money_data = app.utils.parseMoney(data);

          if (app.utils.validateMoney(money_data)) throw new TypeError('Invalid charge amount');

          // handle optional type
          if (obj.type === 'negative') {
            money_data = -Math.abs(money_data);
          } else {
            money_data = Math.abs(money_data);
          }

          delete obj.type;

          return parseFloat(money_data);
        },

        ISO: function(data) {
          var date_data = moment.utc(data);
          if (date_data.isValid() === false) throw new TypeError('Invalid ISO date input');
          return date_data.toISOString().slice(0, -5);
        },

        array: function(data) {
          if (!Array.isArray(data)) data = [data];
          return data;
        }
      },
    },

    // Utility methods
    utils: {
      stash: localStorage || {
        getItem: function() {},
        setItem: function() {},
        removeItem: function() {}
      },
      load: new Loader(),
      loadView: new Loader('view'),
      loadModel: new Loader('model'),
      loadCollection: new Loader('collection'),

      // Generate promises
      promises: function(quantity) {
        if (typeof quantity !== 'number') return;
        var promises = [];
        while (quantity-- > 0) promises.push($.Deferred());
        
        return promises;
      },

      // Device check
      hasTouch: function() {
        // Chrome 53.0.3785.143 has begun including this key as null for desktop
        // return 'ontouchstart' in window;
        return !!window.ontouchstart;
      },

      isMobile: function() {
        var regex = /(iP(od|hone|ad))|(IEMobile)|(Windows Phone)|(Blackberry)|(BB10)|(Android.*Mobile)/i;
        return regex.test(window.navigator.userAgent);
      },

      isIE: function() {
        var appName = window.navigator.appName;
        return appName === 'Microsoft Internet Explorer' ? true : false;
      },

      prepInputs: function(view) {
        var $phone_inputs = view.$el.find('input.phone');

        if (app.utils.isMobile()) {
          view.$el.find('input.mobile-number').attr({
            'type': 'number',
            // 'pattern': '[0-9.]*'
          });
          $phone_inputs.attr('type', 'tel');
        }
        if ($phone_inputs.length > 0) $phone_inputs.mask('(000) 000-0000');

        view.$el.find('.chosen').chosen({
          // width: '100%',
          disable_search: true
        });

        app.controls.smartTextarea(view);

        var $money_inputs = view.$el.find('.money input');

        if ($money_inputs.length > 0) app.controls.maskMoney($money_inputs, view);

        view.$el.find('.chosen-multiple').chosen();
        view.$el.find('.focus').focus();
      },

      // Trim objects
      trim: function(_object) {
        var self = this;
        _.each(_object, function(value, key) {

          var type = typeof value;

          if (type == 'string') {
            if (value === '') {
              delete _object[key];
            } else {
              _object[key] = $.trim(value);
            }
          } else if (value === null || value === undefined) {
            delete _object[key];
          } else if (type == 'object') {
            self.trim(value);
          }
        });

        return _object;
      },

      /**
       * Manual AJAX requests (for exposed endpoints)
       *
       * @param  {object}   options   [data, path, method, refresh, timeout duration]
       * @param  {Function} callback  [callback functions to run after]
       * @return {$.Deferred}         [return promise]
       */

      request: function(_options, callback) {

        var self = this;
        if (!_options) _options = {};

        // If data was passed, stringify it
        if (_options.data) _options.data = JSON.stringify(_options.data);

        // Default options
        var options = _.extend({
          method: 'POST',
          path: '',
          timeout_duration: 30000
        }, _options);

        var promise = $.Deferred();

        // Check if the API is hanging, show an error message
        var timeout = setTimeout(function() {
          app.alerts.error('The request timed out.');
          request.abort();
        }, options.timeout_duration);

        var pat = /^https?:\/\//i;
        if (!pat.test(options.path)) {
          options.path = app.API() + options.path;
        }

        // Begin the API request
        var request = $.ajax({
          url: options.path,
          method: options.method,
          data: options.data,

          retryCount: 0,
          retryLimit: 2,

          beforeSend: function(xhr) {
            if (options.noheaders) return;

            if (options.refresh)
              app.session.injectHeader(xhr, 'Refresh', app.utils.stash.getItem('refresh'));

            var auth_token = self.stash.getItem('authorization');
            if (auth_token) app.session.injectHeader(xhr, 'Authorization', auth_token);

            var act_token = self.stash.getItem('activation');
            if (act_token) app.session.injectHeader(xhr, 'Activation', act_token);

            var pw = app.session.tokens.pass;
            if (pw) app.session.injectHeader(xhr, 'Password', pw);
          },

          success: function(response) {
            if (response.session && response.session.activation_token)
            if (callback && 'success' in callback) callback.success(response);
            promise.resolve(response);
          },

          error: function(mod, res) {
            if (callback && 'error' in callback) callback.error(mod, res);
            promise.reject(mod);
          },

          complete: function(response) {
            clearTimeout(timeout);
            if (callback && 'complete' in callback) callback.complete(response);
          }
        });

        _.extend(request, promise);

        return request;
      },

      getFocused: function() {
        return document.activeElement;
      },

      getOrdinal: function(n) {
        var s = ['th', 'st', 'nd', 'rd'], v = n % 100;
        return (s[(v - 20) % 10] || s[v] || s[0]);
      },

      // NOTE: not sure if this will be useful...
      modelNames: function(modelName, singularToPlural) {
        if (typeof modelName !== 'string') return false;
        if (typeof singularToPlural !== 'boolean') return false;

        var models = {
          'users': 'user',
          'admins': 'admin',
          'managers': 'manager',
          'tenants': 'tenant',
          'landlords': 'landlord',
          'companies': 'company',
          'properties': 'property',
          'units': 'unit',
          'leases': 'lease',
          'bills': 'bill',
          'transfers': 'transfer'
        };

        if (singularToPlural === true) {
          for (var key in models) {
            if (modelName === models[key]) return key;
          }
        } else if (singularToPlural === false) {
          return models[modelName];
        }

      },

      // Generate DOM friendly names from artibrary strings
      domFriendlyString: function(name) {
        name = name + '';
        return name.replace(/[^a-z0-9]/g, function(s) {
          var c = s.charCodeAt(0);
          if (c == 32) return '-';
          if (c >= 65 && c <= 90) return '_' + s.toLowerCase();
          return '__' + ('000' + c.toString(16)).slice(-4);
        });
      },

      // Detect transitionEnd
      whichTransitionEvent: function(){
        var t, el = document.createElement('fakeelement');

        var transitions = {
          'transition'      : 'transitionend',
          'OTransition'     : 'oTransitionEnd',
          'MozTransition'   : 'transitionend',
          'WebkitTransition': 'webkitTransitionEnd'
        };

        for (t in transitions){
          if (el.style[t] !== undefined){
            return transitions[t];
          }
        }
      },

      /**
       * Turns arbirtrary numerical strings or numbers into valid currency
       *
       * @param  {string/number}  _amount   [number or string to be parsed]
       * @return {string}         string    [with two decimal places, or false]
       */

      parseMoney: function(_amount) {
        // if (!_amount) return; // $0 should totally be pretty too
        if (!['string', 'number'].contains(typeof _amount)) return;
        // check for invalid chars
        if (/[^$,\.\d\-\+]/.test(_amount)) {
          return false;
        }

        // remove dollar sign, parse, fix decimals
        var amount = parseFloat(('' + _amount).replace(/[\$\,]/g,'')).toFixed(2);
        if (typeof amount == 'string') {
          return amount;
        } else {
          return false;
        }
      },

      /**
       * Splits a full name into its basic parts
       *
       * @param  {string}  _full_name  [complete name to be parsed]
       * @return {object}              [parsed name object]
       */

      parseName: function(_full_name) {
        var name_array = _full_name.split(' ');

        var last;
        if (name_array.length > 1) last = name_array.pop() + '';
        var first = name_array.join(' ');

        var name_data = {
          first_name: first
        };

        if (last) name_data.last_name = last;

        return name_data;
      },

      /**
       * Validates form data
       *
       * @param  {Backbone.View} _view      [the view to validate from]
       * @param  {object}        _formData  [optional data object to validate]
       * @return {boolean}                  [did the data validate on the model]
       */

      validate: function(_view, _formData) {

        var formData = !_formData ? {} : _formData;
        var backup = _view.model.clone().attributes;

        if (!_formData) {
          var $form = _view.$el.find('form');
          formData = $form.serializeObject();
        }

        _view.model.set(formData);

        var invalid = _view.model.validate();

        console.log(invalid);

        // scroll to first error
        if (app.utils.scrollToErrors(_view)) invalid = true;
        
        _view.model.clear().set(backup);

        return invalid ? false : true;
      },

      scrollToErrors: function(_view) {
        var $errors = _view.$el.find('.has-error');
        var check;

        if ($errors.length) {
          check = true;
          var first_error = $errors[0];
          var $scroll_container = _view.$el.find('.scroll-container');
          
          if ($scroll_container.length) {
            var offset = $(first_error)[0].offsetTop;

            $scroll_container.animate({
              scrollTop: offset
            }, 600);
          }
        } else {
          check = false;
        }

        return check;
      },

      /**
       * Validates currency inputs
       *
       * @param  {string} input  [the string to validate]
       * @return {Error}         [return an error message if it fails]
       */

      validateMoney: function(input, field, attributes, canBeZero) {
        var errorMessage = 'Please enter a valid amount';
        // if (typeof input == 'undefined') return; // HACK: to make this field optional

        try {
          if (typeof input == 'undefined') throw new TypeError();
          if (isNaN(input)) throw new TypeError();
          // console.log(canBeZero)
          if (!canBeZero && !+input) throw new TypeError();

          var zeroFloat;
          var decimal;

          input = input.toString();

          if (input.indexOf('.') > -1) {
            decimal = input.split('.')[1];
            if (decimal.length > 2) throw new TypeError();
          }

          var parsed_input = parseInt(input);
          var parsed_string = parsed_input.toString();

          if (decimal) parsed_string += '.' + decimal;
          if (parsed_string != input) throw new TypeError();

        } catch(e) {
          console.error(e);
          return errorMessage;
        }
      },

      validateCharges: function(inputs) {
        var error;

        if (!inputs) return;

        inputs.forEach(function(input) {
          if (input.amount === undefined) input.amount = '';
          var invalid = app.utils.validateMoney(input.amount);

          if (invalid) {
            // Backbone validation doesn't know how to handle field arrays, so
            // we have to manually render the errors
            var $inputs = $('input[name*="amount"]').filter(function() {
              return this.value == input.amount;
            });
            app.controls.fieldError({
              element: $inputs,
              type: 'error',
              error: invalid
            });

            error = 'Invalid input';
          }
        });

        return error;
      },

      /**
       * Validate email / phone via a single method
       *
       * @param  {string}   _string       [string to validate]
       * @param  {boolean}  _response     [is an object desired as a response]
       * @return {string/object}          [either a string of the parsed contact or an object with formatted data]
       */

      validateContact: function(_string, _response) {
        var response;

        if (!_string) return false;
        if (typeof _string !== 'string') {
          console.error('validateContact() expects a string as first argument.');
        }
        if (_response) {
          if (typeof _response !== 'boolean') {
            console.error('validateContact() expects a boolean as second argument');
          }
          response = {};
        }
        // check if its a US phone number
        var phone_check = _string.replace(/\D/g, '');
        // console.log(phone_check)
        if (phone_check.length == 10 || phone_check.length == 11) {

          if (/[^0-9]/g.test(phone_check)) {
            return false;
          }
          if (phone_check.length === 11 && phone_check.charAt(0) !== 1) return false;

          if (_response) {
            response['phone'] = phone_check.replace(/[^0-9]/g, '');
            return response;
          }
          return 'phone';
        }

        // check if its an email address
        if (/[^@]+@[^@]+/i.test(_string)) {
          if (_response) {
            response['email'] = _string;
            return response;
          }
          return 'email';
        }
        return false;
      },

      /**
       * Add a $ to a currency string, with negative outside if applicable
       * @param  {string/number} amount   [amount to process (ie -50.00)]
       * @return {string}                 [pretty amount (ie -$50.00)]
       */

      prettyMoney: function(amount) {
        // console.log(amount)
        var parsed = parseFloat(amount);
        var leader = '';
        if (parsed < 0) leader = '-';
        parsed = Math.abs(parsed);
        var number_string = app.utils.parseMoney(parsed);
        // console.log(number_string)
        return leader + '$' + number_string.replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
      },

      /**
       * Transform an unformatted phone number to be human readable
       *
       * @param  {string} _string   [unformatted phone (ie 6175551234)]
       * @return {string}           [formatted phone (ie (617) 555-1234)]
       */

      prettyPhone: function(_string) {
        if (!this.validateContact(_string)) return;
        var area_code = _string.slice(0, 3);
        var exchange = _string.slice(3, 6);
        var line_number = _string.slice(6, 10);
        return '(' + area_code + ') ' + exchange + '-' + line_number;
      },

      /**
       * Tranform human readable phone into raw phone string
       *
       * @param  {string} _string   [formatted phone (ie (617) 555-1234)]
       * @return {string}           [unformatted phone (ie 6175551234)]
       */

      uglyPhone: function(_string) {
        return this.validateContact(_string, true).phone;
      },

      // Logic for table sorting a collection
      sortCollection: function(event, context) {
        var $target = event ? $($(event.currentTarget)[0]) : context.$el.find('.sorted');
        var field = $target.attr('data-field-sort') || $target.attr('data-field');

        if ($target.length === 0 || !field) {
          context.renderTable();
          return false;
        }

        // if the sort was event triggered
        if (event) {
          context.$el.find('.thead a').not($target).removeClass('sorted reverse');

          if (!$target.hasClass('sorted')) {
            $target.addClass('sorted');
            context.collection.sortByField(field);
          } else if ($target.hasClass('sorted reverse')) {
            $target.removeClass('reverse');
            context.collection.models.reverse();
          } else if ($target.hasClass('sorted')) {
            $target.addClass('reverse');
            context.collection.models.reverse();
          }
        // if no event, just re-sort
        } else {
          if ($target.hasClass('sorted reverse')) {
            context.collection.sortByField(field);
            context.collection.models.reverse();
          } else if ($target.hasClass('sorted')) {
            context.collection.sortByField(field);
          }
        }
        context.renderTable();

        // if there is a selected row, keep it selected
        var selected;

        if (context.parentModel) {
          selected = app.views.unitsView.selected;
        } else {
          selected = app.views.currentView.selected;
        }

        if (selected) {
          context.$el.find('.row[data-id="' + selected + '"]').addClass('selected');
        }

        return context;
      },

      // Capitalize first letter of a string
      capitalize: function(_string) {
        console.log(_string)
        return _string.charAt(0).toUpperCase() + _string.slice(1);
      },

      stateAbbr: function(input) {

        var states = [
            ['Arizona', 'AZ'],
            ['Alabama', 'AL'],
            ['Alaska', 'AK'],
            ['Arizona', 'AZ'],
            ['Arkansas', 'AR'],
            ['California', 'CA'],
            ['Colorado', 'CO'],
            ['Connecticut', 'CT'],
            ['Delaware', 'DE'],
            ['Florida', 'FL'],
            ['Georgia', 'GA'],
            ['Hawaii', 'HI'],
            ['Idaho', 'ID'],
            ['Illinois', 'IL'],
            ['Indiana', 'IN'],
            ['Iowa', 'IA'],
            ['Kansas', 'KS'],
            ['Kentucky', 'KY'],
            ['Kentucky', 'KY'],
            ['Louisiana', 'LA'],
            ['Maine', 'ME'],
            ['Maryland', 'MD'],
            ['Massachusetts', 'MA'],
            ['Michigan', 'MI'],
            ['Minnesota', 'MN'],
            ['Mississippi', 'MS'],
            ['Missouri', 'MO'],
            ['Montana', 'MT'],
            ['Nebraska', 'NE'],
            ['Nevada', 'NV'],
            ['New Hampshire', 'NH'],
            ['New Jersey', 'NJ'],
            ['New Mexico', 'NM'],
            ['New York', 'NY'],
            ['North Carolina', 'NC'],
            ['North Dakota', 'ND'],
            ['Ohio', 'OH'],
            ['Oklahoma', 'OK'],
            ['Oregon', 'OR'],
            ['Pennsylvania', 'PA'],
            ['Rhode Island', 'RI'],
            ['South Carolina', 'SC'],
            ['South Dakota', 'SD'],
            ['Tennessee', 'TN'],
            ['Texas', 'TX'],
            ['Utah', 'UT'],
            ['Vermont', 'VT'],
            ['Virginia', 'VA'],
            ['Washington', 'WA'],
            ['West Virginia', 'WV'],
            ['Wisconsin', 'WI'],
            ['Wyoming', 'WY'],
        ];

        var check;
        var output;

        if (input.length == 2) {
          input = input.toUpperCase();
          check = states.find(function(state) {
            if (state[1] === input) return state;
          });
          output = check[0];
        } else {
          input = input.toLowerCase();
          check = states.find(function(state) {
            if (state[0].toLowerCase() === input) return state;
          });
          output = check[1];
        }
        return output;
      },

      getOnboardingSteps: function(user) {
        var steps = [];

        var is_tenant = user.role === 'tenant';
        var is_admin = user.role === 'admin';

        var dwolla_account = is_admin ? user.company.dwolla : user.dwolla;
        var is_first_admin = is_admin && !dwolla_account;

        // step 1 - Check for Lease - Tenants
        if (is_tenant && !user.leases.length) {
          steps.push({
            name: 'no_lease',
            value: false,
            options: {
              background: 'rgb(213, 91, 85)'
            }
          });
          return steps;
        }

        if (is_tenant) {
          steps.push({
            name: 'terms',
            value: user.terms_accepted,
            options: {
              background: 'rgb(0, 113, 188)'
            }
          });
        }

        // step 2 - Dwolla account - Admins & Tenants
        if (is_tenant || is_admin) {
          if (is_first_admin) {
            steps.push({
              name: 'dwolla_type',
              value: dwolla_account,
              options: {
                background: 'rgb(0, 113, 188)'
              }
            });

            steps.push({
              name: 'dwolla_verify',
              value: dwolla_account,
              options: {
                background: 'rgb(60, 81, 132)'
              }
            });
          }

          // step 3 - Dwolla IAV - Admins & Tenants
          if (!user.status.active) {
            steps.push({
              name: 'dwolla_iav',
              value: !(!dwolla_account || (dwolla_account && !dwolla_account.primary_funding_source)),
              dwolla_account: dwolla_account,
              options: {
                background: 'rgb(25, 158, 134)'
              }
            });
          }
        }

        // step 4 - Split/autopay for all leases - Tenants
        if (is_tenant) {
          user.leases.forEach(function(lease) {

            var has_split = lease.split && lease.split.hasOwnProperty(user._id);

            steps.push({
              name: 'show_lease',
              value: has_split,
              lease: lease,
              options: {
                background: 'rgb(213, 91, 85)'
              }
            });

            steps.push({
              name: 'split',
              value: has_split,
              lease: lease,
              options: {
                background: 'rgb(0, 169, 157)'
              }
            });

          });
        }

        // step 5 - Password - All users
        if (!user.status.password) {
          steps.push({
            name: 'password',
            value: user.status.active,
            options: {
              background: 'rgb(0, 113, 188)'
            }
          });
        }

        return steps.map(function(step, index) {
          step.index = index;
          return step;
        });
      }
    }
  });

  // Extend Backbone's View.close() method
  Backbone.View.prototype.close = function() {
    this.remove();
    this.unbind();
    if (this.onClose) this.onClose();
  };

  // Add Backbone method for saving an entire collection
  Backbone.Collection.prototype.save = function(options) {
    Backbone.sync('update', this, options);
  };

  // Allow for nested gets
  Backbone.Model.prototype.get = function (attr) {
    if (attr.indexOf('.') < 0) return this.attributes[attr];

    return _.reduce(attr.split('.'), function (o, k) {
      return o && o[k];
    }, this.attributes);
  };

  // Custom Backbone.Validation validators
  _.extend(Backbone.Validation.validators, {
    arrayItems: function(value, attr, customValue, model) {
      if (!Array.isArray(value)) return 'Value must be an array';

      value.every(function(element, index, array) {
        for (var rule in customValue) {
          if (rule.required === true) {
            if (typeof element[rule] === 'undefined') return false;
          }
        }
      });
    }
  });

  _.extend(_.templateSettings, {
    evaluate:    /\{\{#([\s\S]+?)\}\}/g,            // {{# console.log("blah") }}
    interpolate: /\{\{[^#\{]([\s\S]+?)[^\}]\}\}/g,  // {{ title }}
    escape:      /\{\{\{([\s\S]+?)\}\}\}/g,         // {{{ title }}}
  });

  // Custom Backbone.Validation patterns
  _.extend(Backbone.Validation.patterns, {
    alphanumeric: /^[a-zA-Z0-9_]*$/,
    alphabetical: /^[a-zA-Z\s_]*$/,
    password: /^(?=.*[A-Z])(?=.*[0-9])(?=.*[a-z]).{8,}$/,
    zip: /^\d{5}(?:[-\s]\d{4})?$/
  });

  // Custom Backbone.Validation messages
  _.extend(Backbone.Validation.messages, {
    alphanumeric: 'Please enter only letters and numbers',
    alphabetical: 'Please enter only letters',
    password: 'Your password must contain at least one lowercase letter, one uppercase letter, and one number',
    zip: 'Please enter a valid US zip code'
  });

  // Backbone Validation global callbacks
  _.extend(Backbone.Validation.callbacks, {

    valid: function (view, attr, selector) {
      var $el = view.$('[name="' + attr + '"]'),
          $group = $el.closest('.field-group');

      $group.removeClass('has-error');
      $group.find('.help-text').html('').addClass('hidden');
    },

    invalid: function (view, attr, error, selector) {
      var $el = view.$('[name="' + attr + '"]');
      if ($el.length < 1) $el = view.$('.' + attr); // if name doesn't match use class
      var $group = $el.closest('.field-group');

      $group.addClass('has-error');
      $group.find('.help-text').html(error).removeClass('hidden');

      app.controls.modalShake(view);
    }
  });

  function contains(context, args) {
    var self = context;
    var queryMap = {};

    _.each(args, function(q) {
      queryMap[q] = self.indexOf(q) > -1;
    });

    return _.every(queryMap, function(x) {
      return x === true;
    });
  }

  // Contains prototype methods, can take multiple arguments
  Array.prototype.contains = function() {
    return contains(this, arguments);
  };

  String.prototype.contains = function(query) {
    return contains(this, arguments);
  };

  // Insert string into string at index
  String.prototype.insert = function (string, index) {
    if (index > 0) {
      return this.substring(0, index) + string + this.substring(index, this.length);
    } else if (typeof index === 'undefined') {
      return this + string;
    } else {
      return string + this;
    }
  };

  // Choose a single supported transition event
  app.utils.transitionEvent = app.utils.whichTransitionEvent();

  return app;

});
