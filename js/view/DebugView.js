/**
 * DebugView.js
 */

define([
  'app',
  'model/admin/debug/TestModel',
  'text!templates/debug/menu.html'
],
function(app, TestModel, DebugMenuTemplate) {

  return Backbone.View.extend({

    className: 'debug-menu',

    template: _.template(DebugMenuTemplate),

    events: {
      'click .action-debug-toggle': 'toggleMenu',
      'click .action-console-app': 'consoleApp',
      'click .action-console-session': 'consoleSession',
      'click .action-console-user': 'consoleUser',
      'click .action-console-stash': 'consoleStash',
      'click .action-require-modules': 'consoleRequire',
      'click .action-switch-api': 'switchAPI',
      'click .action-global-app': 'globalApp',
      'click .action-unit-tests': 'unitTests',
      'click .action-clear-stash': 'clearStash',
      'click .action-view-stash': 'viewStash',

      'click .action-skip-iav': 'skipIAV',

      'click .action-error': 'sendError',
      'click .action-alert': 'alertError',
      'click .action-success': 'alertSuccess',
      'click .action-warn': 'alertWarn',

      'change #toggle-activation': 'toggleActivation'
    },

    initialize: function() {
      var self = this;
      app.session.on('change:logged_in', this.render, this);

      require(['jasmine-boot'], function() {
        self.render();
      });
    },

    render: function() {
      // keyboard shortcut for debugger
      $(window).keydown(function(e) { if (e.keyCode == 123) debugger; });
      
      this.$el.html(this.template({
        activation: app.utils.stash.getItem('bypass-activation')
      }));
      this.$el.find('.app-version').html(app.version);
      this.$el.find('.app-root').html(app.url.base_url);
      this.$el.find('.backbone-version').html(Backbone.VERSION);
      this.renderAPI();
      this.renderUser();
      $('body').append(this.$el);

      
      return this;
    },

    renderAPI: function() {
      this.$el.find('.api-root').html(app.API());
      this.checkAPI();
    },

    renderUser: function() {
      var user = app.session.user;

      this.$el.find('.user-role').html(user.get('role'));
      this.$el.find('.user-name').html(user.get('full_name'));
      try {
        this.$el.find('.user-email').html((user.get('email') || '-Not Set-') + ' (' + (user.get('status.email') ? 'verfied' : 'unverified') + ')');
      } catch(err) {}

      try {
        this.$el.find('.user-phone').html((user.get('phone_pretty') || '-Not Set-') + ' (' + (user.get('status.phone') ? 'verfied' : 'unverified') + ')');
      } catch(err) {}

      try {
        this.$el.find('.user-dwolla').html(user.get('status.dwolla'));
      } catch(err) {}

      this.$el.find('.atoken').html(user.get('session.authorization_token'));
      
      this.$el.find('.user-company').html(user.get('company.name') || user.get('company'));
      // this.$el.find('.user-company-id').html(app.session.user.get('company_id'));
    },

    toggleActivation: function(e) {
      var isChecked = $(e.currentTarget).is(':checked');
      if (isChecked) {
        app.utils.stash.setItem('bypass-activation', true);
      } else {
        app.utils.stash.removeItem('bypass-activation');
      }
    },

    // increment thru the list of possible API locations
    toggleAPI: function() {
      var roots = [
        'https://api.plutus.dev/', // local
        'https://postman.plutus.dev/', // local postman
        'http://10.1.10.38:81/', // LAN (chris)
        'https://10.1.10.38:443/', // LAN SSL
        'https://api.staging.payment.rafiproperties.com/', // staging
        'http://api.payment.rafiproperties.com/', // production
        // 'http://209.6.68.251:81/', // remote brighton (chris)
      ];

      var current = app.utils.stash.getItem('API') || app.API();
      var index = roots.indexOf(current);

      if (index >= (roots.length -1)) index = -1;

      var next = roots[index + 1];
      app.utils.stash.setItem('API', next);

      this.renderAPI();
    }, 

    checkAPI: function() {
      var self = this;

      app.utils.request({
        method: 'GET'
      }).then(function() {
        self.$el.find('.status-icon').addClass('success').removeClass('error');
      }).fail(function(e) {
        console.warn(e);
        self.$el.find('.status-icon').removeClass('success').addClass('error');
      });
    },

    switchAPI: function() {
      var self = this;
      app.router.checkAuth().then(function() {
        app.controls.logout();
      }).always(function() {
        self.toggleAPI();
      });
    },

    toggleMenu: function() {
      this.$el.toggleClass('active');
    },

    consoleApp: function() {
      console.log(app);
    },

    consoleSession: function() {
      console.log(app.session);
    },

    consoleStash: function() {
      console.log(app.utils.stash);
    },

    consoleRequire: function() {
      console.log(require.s.contexts._.defined);
    },

    consoleUser: function() {
      console.log(app.session.user.attributes);
    },

    globalApp: function() {
      window.app = app;
      console.log(window.app);
    },

    clearStash: function() {
      app.utils.stash.clear();
      console.log('app stash cleared');
    },

    viewStash: function() {
      console.log(app.utils.stash);
    },

    sendError: function(error) {
      throw new TypeError('This is a test error');
    },

    alertError: function() {
      app.alerts.error('This is a test error!');
    },

    alertSuccess: function() {
      app.alerts.success('This is a test success messsage!');
    },

    alertWarn: function() {
      app.alerts.warn('This is a test warning!');
    },

    showUnitTests: function() {
      console.log('run unit tests')
      console.log($('.jasmine_html-reporter'));
      $('.jasmine_html-reporter').addClass('visible');
    },

    skipIAV: function() {
      console.log(app.views.activateView);

      var path;
      var activateView = app.views.activateView;
      var data = {
        id: 'ee36bb47-0960-4c5e-85a8-a933e33e941b', // id
        status: 'unverified'
      };

      if (app.session.get('logged_in')) {
        // if already active, just 
        path = 'account/funding_sources';
      } else {
        // if activating, set primary
        path = activateView.user.get('role') + 's/activate/funding_sources';
      }

      app.utils.request({
        path: path,
        method: 'POST',
        data: data
      }).then(function(data) {
        // user has new primary funding source :D
        activateView.user.set(data);
        activateView.next();
      });
    },

    // jasmine unit tests
    unitTests: function() {
      
      if (this.unit_tests) {
        this.showUnitTests();
        return;
      }

      this.unit_tests = true;

      describe('app.schema.process', function() {
        it('should convert formatted phone numbers', function() {
          var data = {
            first_name: 'John',
            last_name: 'Doe',
            phone: '(617) 555-5555'
          };

          var processed = app.schema.process(data, app.session.user);

          var expected = {
            first_name: 'John',
            last_name: 'Doe',
            phone: '6175555555'
          };

          expect(processed).toEqual(expected);
        });

        // it('should throw error for invalid phone number', function() {
        //   var data = {
        //     first_name: 'John',
        //     last_name: 'Doe',
        //     phone: '(617) 555-55554'
        //   };

        //   expect(function() { app.schema.process(data, app.session.user); } ).toThrow(new TypeError('Invalid phone number input'));
        // });

        // it('should throw error for nested invalid phone number', function() {
        //   var data = {
        //     first_name: 'John',
        //     last_name: 'Doe',
        //     manager: {
        //       phone: '(617) 555-55554'
        //     }
        //   };

        //   console.log(app.schema.process(data, new TestModel()))

        //   expect(function() { app.schema.process(data, new TestModel()); } ).toThrow(new TypeError('Invalid phone number input'));
        // });

        it('should handle nested schemas', function() {
          var data = {
            phone: '(617) 555-5432',
            manager: {
              phone: '(617) 555-1234',
              test: {
                date: moment('4/20/1960'),
                phone: '(617) 555-4433',
                more: {
                  phone: '(617) 555-5432',
                  date: moment('5/30/1999'),
                  amount: '2400.50'
                }
              }
            }
          };

          var processed = app.schema.process(data, new TestModel());

          var expected = {
            phone: '6175555432',
            manager: {
              phone: '6175551234',
              test: {
                date: '1960-04-20T04:00:00.000Z',
                phone: '6175554433',
                more: {
                  phone: '6175555432',
                  date: '1999-05-30T04:00:00.000Z',
                  amount: 2400.5
                }
              }
            }
          };

          expect(processed).toEqual(expected);
        });
      });

      describe('app.schema.format.money', function() {
        it('should convert an integer to valid currency string', function() {
          var data = 250;
          var check = app.schema.format.money(data);
          expect(check).toEqual(250);
        });

        it('should convert a currency string without decimals to valid currency string', function() {
          var data = '250';
          var check = app.schema.format.money(data);
          expect(check).toEqual(250);
        });

        it('should convert a currency string with dollar sign to valid currency string', function() {
          var data = '$250';
          var check = app.schema.format.money(data);
          expect(check).toEqual(250);
        });

        it('should throw an error for invalid input', function() {
          var invalid_data = '349jd';
          expect(function() { app.schema.format.money(invalid_data); }).toThrow(new TypeError('Invalid currency amount'));
        });

        it('should throw an error for invalid input', function() {
          var invalid_data = '$39.23>';
          expect(function() { app.schema.format.money(invalid_data); }).toThrow(new TypeError('Invalid currency amount'));
        });

        it('should throw an error for invalid input', function() {
          var invalid_data = '(*&)*&^%';
          expect(function() { app.schema.format.money(invalid_data); }).toThrow(new TypeError('Invalid currency amount'));
        });
      });

      describe('app.schema.format.phone', function() {
        it('should convert a pretty phone number to uglified phone number', function() {
          var data = '(203) 555-1234';
          var check = app.schema.format.phone(data);
          expect(check).toEqual('2035551234');
        });

        // it('should throw an error for invalid input', function() {
        //   var invalid_data = '(203) 555-12343';
        //   expect(function() { app.schema.format.phone(invalid_data); }).toThrow(new TypeError('Invalid phone number input'));
        // });
      });

      describe('app.schema.format.ISO', function() {
        it('should convert a date string to ISOString', function() {
          var data = '4/20/2012';
          var check = app.schema.format.ISO(data);
          expect(check).toEqual('2012-04-20T04:00:00.000Z');
        });

        it('should convert a moment object to ISOString', function() {
          var data = moment('4/20/2012');
          var check = app.schema.format.ISO(data);
          expect(check).toEqual('2012-04-20T04:00:00.000Z');
        });

        it('should throw an error for invalid input', function() {
          var invalid_data = '20398234.234/234/234234';
          expect(function() { app.schema.format.ISO(invalid_data); }).toThrow(new TypeError('Invalid ISO date input'));
        });
      });

      describe('app.utils.stash', function() {
        it('should save and retrieve a string to app stash', function() {
          app.utils.stash.setItem('test', 'ok');
          var check = app.utils.stash.getItem('test');

          if (check === 'ok') app.utils.stash.removeItem('test');
          expect(check).toMatch('ok');
        });
      });

      describe('app.utils.parseMoney', function() {
        it('should properly handle too many decimal places', function() {

          var check = app.utils.parseMoney('123.333');

          expect(check).toMatch('123.33');
        });

        it('should properly handle not enough decimals', function() {
          var check = app.utils.parseMoney('123.3');

          expect(check).toMatch('123.30');
        });

        it('should properly handle no decimals', function() {
          var check = app.utils.parseMoney('123');

          expect(check).toMatch('123.00');
        });
      });

      describe('app.utils.parseName', function() {
        it('should correctly split up a name with multiple parts', function() {

          var check = app.utils.parseName('Ben Stein Goldfish');

          var expected = {
            first_name: 'Ben Stein',
            last_name: 'Goldfish'
          }

          expect(check).toEqual(expected);
        });

        it('should correctly split up a name with multiple parts', function() {

          var check = app.utils.parseName('Ben');

          var expected = {
            first_name: 'Ben'
          }

          expect(check).toEqual(expected);
        });
      });

      describe('app.utils.validateContact', function() {
        it('should return "email" for testemail@gmail.com', function() {
          var check = app.utils.validateContact('testemail@gmail.com');

          expect(check).toMatch('email');
        });

        it('should return "email" for test@gmail.com', function() {
          var check = app.utils.validateContact('test@gmail.com');

          expect(check).toMatch('email');
        });

        it('should return "email" for tes@gmail.com', function() {
          var check = app.utils.validateContact('tes@gmail.com');

          expect(check).toBe(false);
        });

        it('should return "phone" for (203) 555-1234', function() {
          var check = app.utils.validateContact('(203) 555-1234');

          expect(check).toMatch('phone');
        });

        it('should return "phone" for 2035551234', function() {
          var check = app.utils.validateContact('2035551234');

          expect(check).toMatch('phone');
        });

        it('should return false for (203) 555-1234-65', function() {
          var check = app.utils.validateContact('(203) 555-1234-65');

          expect(check).toBe(false);
        });

        it('should return false for "thisisinvalid"', function() {
          var check = app.utils.validateContact('thisisinvalid');

          expect(check).toBe(false);
        });

        it('should return a phone object when second arg is true', function() {
          var check = app.utils.validateContact('(203) 555-1234', true);

          var expected = {
            phone: '2035551234'
          };

          expect(check).toEqual(expected);
        });
      });

      // app.utils.trim
      
      describe('app.utils.trim', function() {
        it('should remove empty or null properties in an object', function() {
          var data = {
            first_name: 'Tester',
            last_name: 'Jones',
            test: '',
            test2: null,
            test3: undefined
          };

          var processed = app.utils.trim(data);

          var expected = {
            first_name: 'Tester',
            last_name: 'Jones'
          };

          expect(processed).toEqual(expected);
        });

        it('should remove empty or null properties in a nested object', function() {
          var data = {
            first_name: 'Tester',
            last_name: 'Jones',
            test: '',
            test2: null,
            test3: undefined,
            more: {
              stuff: true, 
              rules: 3,
              but: '',
              you: null,
              dont: undefined
            }
          };

          var processed = app.utils.trim(data);

          var expected = {
            first_name: 'Tester',
            last_name: 'Jones',
            more: {
              stuff: true,
              rules: 3
            }
          };

          expect(processed).toEqual(expected);
        });

      });

      // app.utils.prettyMoney
      
      describe('app.utils.prettyMoney', function() {
        it('should return prettified positive currency', function() {

          var check = app.utils.prettyMoney('20.00');
          expect(check).toEqual('$20.00');
        });

        it('should return prettified negative currency', function() {

          var check = app.utils.prettyMoney('-20.00');
          expect(check).toEqual('-$20.00');
        });
      });

      // app.utils.prettyPhone
      
      describe('app.utils.prettyPhone', function() {
        it('should return prettified phone number', function() {

          var check = app.utils.prettyPhone('6175551234');
          expect(check).toEqual('(617) 555-1234');
        });

        it('should return undefined for invalid phone', function() {

          var check = app.utils.prettyPhone('617555123467');
          expect(check).toBeFalsy();
        });
      });

      // app.utils.uglyPhone
      
      describe('app.utils.uglyPhone', function() {
        it('should return uglified phone number', function() {

          var check = app.utils.uglyPhone('(617) 555-1234');
          expect(check).toEqual('6175551234');
        });

        it('should return false for invalid phone number', function() {

          var check = app.utils.uglyPhone('(617) 555-1234234234');
          expect(check).toBeFalsy();
        });
      });

      // app.utils.findVal
      
      describe('app.utils.findVal', function() {
        it('should return the key of the property which contains desired value at key "h"', function() {

          var data = {
            a: {
              j: 2,
              h: 2,
            },
            b: {
              j: 2,
              h: 3,
            },
            c: {
              j: 2,
              h: 4,
            }
          };

          var check = app.utils.findVal(3, data);

          expect(check).toEqual('b');
        });
      });

      // Array.contains
      
      describe('Array.contains', function() {
        it('should return true for 1 in [1,2,3,4,5]', function() {
          var check = [1,2,3,4.5].contains(1);

          expect(check).toBe(true);
        });

        it('should return false for 9 in [1,2,3,4,5]', function() {
          var check = [1,2,3,4.5].contains(9);

          expect(check).toBe(false);
        });

        it('should return true for 1,2 in [1,2,3,4,5]', function() {
          var check = [1,2,3,4.5].contains(1, 2);

          expect(check).toBe(true);
        });

        it('should return false for 1, 9 in [1,2,3,4,5]', function() {
          var check = [1,2,3,4.5].contains(1, 9);

          expect(check).toBe(false);
        });

        it('should return true for "test" in [1,"test", 3, "more"]', function() {
          var check = [1,'test', 3, 'more'].contains(1);

          expect(check).toBe(true);
        });
      });

      // String.contains
      
      describe('String.contains', function() {
        it('should return true for "a" in "apple"', function() {
          var check = 'apple'.contains('a');

          expect(check).toBe(true);
        });

        it('should return false for "a" in "zoology"', function() {
          var check = 'zoology'.contains('a');

          expect(check).toBe(false);
        });

        it('should return true for "a", "p" in "apple', function() {
          var check = 'apple'.contains('a', 'p');

          expect(check).toBe(true);
        });

        it('should return false for "a", "p" in "zoology', function() {
          var check = 'zoology'.contains('a', 'p');

          expect(check).toBe(false);
        });

        it('should return true for "test" in "this is a test string"', function() {
          var check = 'this is a test string'.contains('test');

          expect(check).toBe(true);
        });
      });

      // String.insert
      
      describe('String.insert', function() {
        it('should return "apple" for "l", 3 in "appe" ', function() {
          var check = 'appe'.insert('l', 3);

          expect(check).toMatch('apple');
        });

        it('should append arg to the end of string if no second arg is passed', function() {
          var check = 'this is a '.insert('test');

          expect(check).toMatch('this is a test');
        });

        it('should prepend to string if index < 0 is passed', function() {
          var check = ' is a test'.insert('this', -1);

          expect(check).toMatch('this is a test');
        });

      });
      
      // jasmine needs this to fire properly
      window.onload();
      
      var self = this;
      setTimeout(function() {
        self.showUnitTests();
      }, 300);
    }

  });
});
