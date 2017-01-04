var Nightmare = require('nightmare');
var http = require('http-request');
var request = require('request');

var chai = require('chai');

var expect = chai.expect;
var should = chai.should();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Front End URL
var client_url = 'http://plutus.dev';

// API URL
var api_url = 'https://api.staging.payment.rafiproperties.com'; // staging
// var api_url = 'http://10.1.10.38';                           // chris local
// var api_url = 'http://209.6.68.251:81';                      // chris brighton
// var mail_url = api_url + ':1080';

// api_url += ':81';

// MailDev
var mail_url = 'http://api.staging.payment.rafiproperties.com:1080';
// var mail_url = 'http://209.6.68.251:82';

var timestamp = + new Date();
// var timestamp = 1482873797090;
var email = timestamp + '@blerg.com';
var password = 'Password1!';

// Common classes
var success_alert = '.alerts .type-success';
var error_alert = '.alerts .type-error';

// Auth Tokens
// var admin_auth_token;
var auth_token;

// describe('run unit tests', function() {
//   this.timeout(20000);

//   it('should pass all unit tests', function(done) {
//     Nightmare({
//       show: true,
//       openDevTools: {
//         mode: 'detach'
//       },
//       webPreferences: {
//         partition: 'persist:' + timestamp
//       }
//     })
//     .goto('https://plutus.dev')
//     .wait('.action-debug-toggle')
//     .click('.action-debug-toggle')
//     .wait(1000)
//     .click('.action-unit-tests')
//     .wait(300)
//     .evaluate(function() {
//       var failures = document.querySelectorAll('.jasmine-failures .jasmine-failed');
//       return failures.length;
//     })
//     .end()
//     .then(function(failures) {
//       console.log(failures);
//       this.failures_quantity = failures;
//       expect(failures).to.equal(0);
//       done();
//     }).catch(function(error) {
//       error.message = this.failures_quantity + ' unit tests failed';
//       done(error);
//     });
//   });
// });

describe('test local plutus.dev', function() {
  this.timeout(20000);

  it('should delete all MailDev emails', function(done) {
    http.delete({
      url: mail_url + '/email/all'
    }, function(error, response) {
      if (error) done(error);
      else done();
    });
  });

  it('should log in a superadmin', function(done) {
    Nightmare({
      show: true,
      openDevTools: {
        mode: 'detach'
      },
      webPreferences: {
        partition: 'persist:' + timestamp
      }
    })
    .goto(client_url)
    .wait('.login-container')
    .insert('form.login input.username', 'cantonellis@rafiproperties.com')
    .insert('form.login input.password', 'password')
    .click('.action-login')
    .wait('.app')
    .end()
    .then(function() {
      done();
    });
  });

  // get api_url here
  it('should log using a refresh token', function(done) {
    Nightmare({
      show: true,
      openDevTools: {
        mode: 'detach'
      },
      webPreferences: {
        partition: 'persist:' + timestamp
      }
    })
    .goto(client_url)
    .wait('.app')

    .click('.action-debug-toggle')
    .wait(1000)

    .end()

    .evaluate(function() {
      var api = document.querySelector('.api-root').innerText;
      return api;
    })
    .then(function(api) {
      // api_url = api;
      done();
    }).catch(function(err) {
      console.log(err);
    });
  });

  // get auth token this time
  it('should create a new company and admin', function(done) {
    Nightmare({
      show: true,
      openDevTools: {
        mode: 'detach'
      },
      webPreferences: {
        partition: 'persist:' + timestamp
      }
    })
    .goto(client_url + '/companies')

    .wait('.action-add')

    .click('.action-add')
    .wait('.modal .form-model')
    .insert('.modal input[name="name"]', timestamp)
    .insert('.modal input[name="admin.first_name"]', timestamp)
    .insert('.modal input[name="admin.last_name"]', timestamp)
    .insert('.modal input[name="admin.email"]', email)
    .click('.action-confirm')
    .wait(success_alert)

    .end()

    // .evaluate(function() {
    //   var a = document.querySelector('.atoken');
    //   return a.innerText
    // })
    .then(function(token) {
      // auth_token = token;
      done();
    });
  });  
  
  var activation_token;  

  it('should check the email address for an invite', function(done) {
    Nightmare({
      show: true,
      openDevTools: {
        mode: 'detach'
      },
      webPreferences: {
        'partition': 'persist:' + timestamp + '1',
        'web-security': false
      }
    })
    .goto(mail_url)
    .wait('.email-item')
    .click('.email-item')
    .wait(1000)
    .evaluate(function() {
      var iframe = document.querySelectorAll('.preview-iframe')[0];
      var html = iframe.contentDocument || iframe.contentWindow.document;
      var button = html.querySelectorAll('a.button')[0];
      return button.href;
    })
    .end()
    .then(function(href) {
      expect(href).to.include('activate?');
      activation_token = href.split('activate?')[1];

      done();
    }).catch(function(error) {
      error.message = 'Expected email to contain valid activation link';
      done(error);
    });
  });

  it('should successfully activate the new admin account', function(done) {
    this.timeout(20000);
    // console.log(activation_token);

    Nightmare({
      show: true,
      openDevTools: {
        mode: 'detach'
      },
      webPreferences: {
        'partition': 'persist:' + timestamp + '2',
        'web-security': false
      }
    })
    .goto(client_url + '/activate?' + activation_token)

    // Select acccount insert
    .wait('.action-type')
    .click('.action-type[data-type="personal"]')

    // Enter account info
    .wait('.grid')
  
    // Personal
    .select('form select[name="dob_month"]', 'July')
    .select('form select[name="dob_day"]', '16')
    .insert('form input[name="dob_year"]', '1975')
    .insert('form input[name="phone"]', '6175551234')
    .insert('form input[name="ssn"]', '4321')

    // Address
    .insert('form input[name="address1"]', '332 Tremont St')
    .insert('form input[name="postalCode"]', '02110')
    .evaluate(function () {
      $('form input[name="postalCode"]').blur();
    })
    .click('label[for="agree"]')
    .wait(1100)
    .click('.action-next')

    // IAV
    .wait('#iav-container iframe')
    .click('.action-debug-toggle')
    .wait(1000)
    .click('.action-global-app')
    .click('.action-skip-iav')

    // Set password
    .wait('input.password')
    .insert('input.password', password)
    .insert('input.password-confirm', password)
    .click('.action-next')

    // Check if dashboard rendered
    .wait('.dashboard')
    .click('.action-logout')
    .end()
    .evaluate(function() {
      var dash = document.querySelectorAll('.dashboard');
      return dash.length;
    })
    .then(function(length) {
      expect(length).to.equal(1);
      done();
    })
    .catch(function(error) {
      console.log(error);
      error.message = 'Dashboard did not render properly';
      done(error);
    });
  });

  it('should log the admin in using the password', function(done) {
    Nightmare({
      show: true,
      openDevTools: {
        mode: 'detach'
      },
      webPreferences: {
        'partition': 'persist:' + timestamp + '3',
        'web-security': false
      }
    })
    .goto(client_url)
    .wait('.login-container')
    .insert('form.login input.username', email)
    .insert('form.login input.password', password)
    .click('.action-login')
    .wait(1000)
    // also save tokens
    .evaluate(function() {
      var a = document.querySelector('.atoken');
      return a.innerText;
    })
    // .end()
    .then(function(token) {
      auth_token = token;
      done();
    })
    .catch(function(error) {
      console.log(error);
    });
  });

  var funding_source_id;

  it('should manually add a funding source via a debug API endpoint', function(done) {
    var data = JSON.stringify({
      "accountNumber": "0123456789",
      "routingNumber": "222222226",
      "type": "checking",
      "name": "My New Bank 1234"
    });

    var r = request({
      url: api_url + '/account/funding_sources/manual',
      method: 'POST',
      body: data,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': auth_token
      }
    }, function(error, response, body) {
      // console.log(arguments);
      if (error) console.error(error);
      else {
        funding_source_id = JSON.parse(response.body).location.split('https://api-uat.dwolla.com/funding-sources/')[1];
        done();
      }
    });
  });

  it('should request microdeposits', function(done) {

    var r = request({
      url: api_url + '/account/funding_sources/' + funding_source_id + '/microdeposits',
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': auth_token
      }
    }, function(error, response, body) {
      // console.log(arguments)
      if (error) console.error(error);
      else done();
    });
  });

  it('should dick around for a minute lol', function(done) {
    Nightmare({
      show: true,
      webPreferences: {
        'partition': 'persist:' + timestamp + '9z'
      }
    })
    .goto('http://www.nyan.cat/')
    .wait(5000)
    .end()
    // also save tokens
    .then(function(token) {
      done();
    });
  });

  it('should set that funding source microdeposits state', function(done) {

    var r = request({
      url: api_url + '/account/funding_sources/' + funding_source_id + '/microdeposits/complete',
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': auth_token
      }
    }, function(error, response, body) {
      if (error) console.error(error);
      else done();
    });
  });

  it('should log the admin in using the token', function(done) {
    Nightmare({
      show: true,
      openDevTools: {
        mode: 'detach'
      },
      webPreferences: {
        'partition': 'persist:' + timestamp + '3',
        'web-security': false
      }
    })
    .goto(client_url)
    .wait('.app')
    
    .click('.action-debug-toggle')
    .wait(1000)

    .evaluate(function() {
      var a = document.querySelector('.atoken');
      // console.log(a.innerText);
      return a.innerText;
    })
    .end()
    .then(function(token) {
      // console.log(token)
      auth_token = token;
      done();
    
    })
    .catch(function(error) {
      console.log(error);
    });
  });

  // it('should verify microdeposits', function(done) {
  //   Nightmare({
  //     show: true,
  //     openDevTools: {
  //       mode: 'detach'
  //     },
  //     webPreferences: {
  //       'partition': 'persist:' + timestamp + '3',
  //       'web-security': false
  //     }
  //   })
  //   .goto(client_url + '/account/payment')
  //   .wait('.money.micro')
  //   .insert('input[name="amount1"]', '06')
  //   .insert('input[name="amount2"]', '08')
  //   .click('.action-send-md')
  //   .wait('.action-make-primary')
  //   .click('.action-make-primary')
  //   .wait('.modal .action-confirm')
  //   .click('.modal .action-confirm')

  //   .end()

  //   .then(function(token) {
  //     auth_token = token;
  //     done();
    
  //   }).catch(function(error) {
  //     console.log(error);
  //   });
  // });

/*
  it('should add a property', function(done) {
    Nightmare({
      show: true,
      openDevTools: {
        mode: 'detach'
      },
      webPreferences: {
        'partition': 'persist:' + timestamp + '3',
        'web-security': false
      }
    })
    .goto(client_url + '/properties')
    .wait('.secondary .action-add')
    .click('.secondary .action-add')
    .wait('.modal .form-model')
    // this has to use type, not insert, added space to avoud find & replace
    .type ('.address-selector', '533 Washington St ')
    .wait('.pac-container .pac-item:first-child')
    .click('.pac-container .pac-item:first-child')
    // .type ('.address-selector', '\uF701') // down
    // .type ('document', '\u000d') // enter
    // .type('body', '\n')
    // .wait(30000)
    // .evaluate(function() {
    //   var field = $('.address-selector');
    //   console.log(field)
    //   field.trigger($.Event('keypress', {
    //     which: '30'
    //   }));
    // })
    // .evaluate(function() {
    //   var field = $('.address-selector');
    //   console.log(field)
    //   field.trigger($.Event('keypress', {
    //     which: '13'
    //   }));
    // })
    
    .insert('input[name="name"]', 'Felt')
    .click('.action-confirm')
    .wait(success_alert)
    .end()
    .then(function() {
      done();
    }).catch(function(error) {
      console.log(error)
    })
  });

  */
 
  var property_id;
 
  it('should add a property via the API', function(done) {
    var data = JSON.stringify({
      "address" : "55 Water St",
      "place_id" : "EiQ1NSBXYXRlciBTdCwgQnJvb2tseW4sIE5ZIDExMjAxLCBVU0E",
      "zip" : "11201",
      "state" : "New York",
      "city" : "Brooklyn",
      "name" : "Dumbo Lofts",
      "country" : "United States",
      "dwolla" : {
         "funding_source" : null
      }
    });
    var r = request({
      url: api_url + '/properties/',
      method: 'POST',
      body: data,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': auth_token
      }
    }, function(error, response, body) {
      var data = JSON.parse(body);
      property_id = data._id;

      if (error) console.error(error);
      else done();
    });
  });

  var unit_id;

  it('should add a unit', function(done) {
    // console.log(property_id);
    Nightmare({
      show: true,
      openDevTools: {
        mode: 'detach'
      },
      webPreferences: {
        'partition': 'persist:' + timestamp + '3',
        'web-security': false
      }
    })
    .goto(client_url + '/properties')
    .wait('.secondary .table-container .col-left')
    .click('.secondary .table-container .row[data-id="' + property_id + '"]')
    .wait('.tertiary .action-add')
    .click('.tertiary .action-add')

    // inside modal
    .wait('.modal .form-model')
    .insert('input[name="number"]', '1A')
    .insert('input[name="beds"]', '2')
    .insert('input[name="baths"]', '1')
    .insert('input[name="sq_ft"]', '1200')
    .insert('input[name="rent"]', '1400')

    // complete
    .click('.action-confirm')
    .wait('.tertiary .selectable .row')
    .evaluate(function() {
      return document.querySelector('.tertiary .selectable .row').dataset.id;
    })
    .end()
    .then(function(id) {
      // console.log('unit: ' + id)
      unit_id = id;
      done();
    })
    .catch(function(error) {
      console.log(error);
    });
  });

  var tenant_name = + new Date();
  var tenant_id;

  it('should invite a tenant', function(done) {
    Nightmare({
      show: true,
      openDevTools: {
        mode: 'detach'
      },
      webPreferences: {
        'partition': 'persist:' + timestamp + '3',
        'web-security': false
      }
    })
    .goto(client_url + '/tenants')
    .wait('.secondary .action-add')
    .click('.secondary .action-add')

    // inside modal
    .wait('.modal .form-model')
    .insert('input[name="first_name"]', tenant_name)
    .insert('input[name="last_name"]', tenant_name)
    .insert('input[name="email"]', tenant_name + '@tenant.com')

    // complete
    .click('.action-confirm')
    .wait(success_alert)
    .end()
    .evaluate(function() {
      return document.querySelector('.secondary .selectable .row').dataset.id
    })
    .then(function(id) {
      // console.log('tenant: ' + id)
      tenant_id = id;
      done();
    })
    .catch(function(error) {
      console.log(error);
    });
  });

  it('should create a lease', function(done) {

    Nightmare({
      show: true,
      openDevTools: {
        mode: 'detach'
      },
      webPreferences: {
        'partition': 'persist:' + timestamp + '3',
        'web-security': false
      }
    })
    .goto(client_url + '/properties/' + property_id + '/units/' + unit_id)

    .wait('.quarternary .action-add-lease')
    .click('.quarternary .action-add-lease')

    // inside modal
    .wait('.modal .form-model .default')

    .select('select.tenants', tenant_id)

    .wait(1000)
    .click('label[for="first"]')
    .click('label[for="last"]')

    // complete
    .click('.modal .action-confirm')
    .wait(success_alert)
    .end()
    .then(function() {
      done();
    })
    .catch(function(error) {
      console.log(error);
    });
  });

  var tenant_activation_token;

  it('should check the tenant email address for an invite', function(done) {
    Nightmare({
      show: true,
      openDevTools: {
        mode: 'detach'
      },
      webPreferences: {
        'partition': 'persist:' + timestamp + '3',
        'web-security': false
      }
    })
    .goto(mail_url)
    .wait('.email-item')
    .click('li:first-child .email-item')
    .wait(1000)
    .evaluate(function() {
      var iframe = document.querySelectorAll('.preview-iframe')[0];
      var html = iframe.contentDocument || iframe.contentWindow.document;
      var button = html.querySelectorAll('a.button')[0];
      return button.href;
    })
    .end()
    .then(function(href) {
      expect(href).to.include('activate?');
      tenant_activation_token = href.split('activate?')[1];

      done();
    }).catch(function(error) {
      error.message = 'Expected email to contain valid activation link';
      done(error);
    });
  });

  it('should successfully activate the new tenant account', function(done) {
    this.timeout(20000);
    // console.log(activation_token);

    Nightmare({
      show: true,
      openDevTools: {
        mode: 'detach'
      },
      webPreferences: {
        'partition': 'persist:' + timestamp + '4',
        'web-security': false
      }
    })
    .goto(client_url + '/activate?' + tenant_activation_token)

    // Select acccount insert
    .wait('.action-next')
    .click('label[for="agree"]')
    .click('.action-next')

    // IAV
    .wait('#iav-container iframe')
    .click('.action-debug-toggle')
    .wait(1000)
    .click('.action-global-app')
    .click('.action-skip-iav')

    // Show lease
    
    .wait('.show_lease')
    .click('.action-next')

    // Set split
    .wait('.split .action-next')
    .click('label[for="autopay"]')
    .click('.action-next')

    // Set password
    .wait('input.password')
    .insert('input.password', password)
    .insert('input.password-confirm', password)
    .click('.action-next')

    // Check if dashboard rendered
    .wait('.bills-view')
    .click('.action-logout')
    .end()
    .evaluate(function() {
      var dash = document.querySelectorAll('.bills-view');
      return dash.length;
    })
    .then(function(length) {
      // console.log(length)
      expect(length).to.equal(1);
      done();
    })
    .catch(function(error) {
      console.log(error);
      error.message = 'Dashboard did not render properly';
      done(error);
    });
  });


});
