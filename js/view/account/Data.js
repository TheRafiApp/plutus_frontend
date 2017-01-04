/**
 * account/Data.js
 */

define([
  'app',
  'model/properties/PropertyModel',
  'model/properties/UnitModel',
  'model/leases/LeaseModel',
  'model/users/TenantModel',
  'text!templates/account/account-data.html',
  'text!templates/repeaters/import-summary.html',
  'jszip',
  'xlsx',
],
function(
  app, 
  PropertyModel, 
  UnitModel, 
  LeaseModel, 
  TenantModel, 
  AccountDataTemplate, 
  SummaryTemplate, 
  jszip
){

  return Backbone.View.extend({

    className: 'account account-data',

    events: {
      'click .action-cancel': 'resetView',
      'click .action-save': 'promptSave',
      'change #file-input': 'filesChosen',
      'drop': 'filesDropped',
      'dragover': 'dragOver',
      'dragleave': 'dragOff'
    },

    supported: [
      'xls',
      'xlsx',
      'xlsm',
      'xlsb',
      'xml',
      'ods'
    ],

    propertyFields: [
      'Address',
      'Name'
    ],

    unitFields: [
      'Number',
      'Beds',
      'Baths',
      'Sq Ft',
      'Start Date',
      'End Date'
    ],

    tenantFields: [
      'First Name',
      'Last Name',
      'Email',
      'Phone'
    ],

    template: _.template(AccountDataTemplate),
    template_summary: _.template(SummaryTemplate),

    initialize: function() {
      // XLSX needs this to be a global to work properly
      window.JSZip = jszip;
      this.render();
    },

    render: function() {
      this.on('confirmSave', this.submitData, this);

      // queue for listing models
      this.queue = {
        property: [],
        unit: [],
        lease: [],
        tenant: []
      };

      this.$el.html(this.template());
      this.delegateEvents();

      return this;
    },

    filesChosen: function(event) {
      var filename = '';
      var $input = this.$el.find('#file-input');
      var $label = this.$el.find('.action-choose');

      // if this method was manually invoked, there is no event
      if (!event) {
        event = { 
          target: { 
            value: '',
            files: [] 
          }
        }; 
      }

      var files = event.target.files;
      var defaultValue = 'CHOOOSE FILE';

      // if multiple files
      if (files && files.length > 1) {
        filename = ($input.attr('data-multiple-caption') || '' ).replace( '{count}', files.length);
      } else {
        filename = event.target.value.split( '\\' ).pop();
      }

      // to accomodate for unsetting via ESC key
      if (filename) {
        $label.children('span').text(filename);
      } else {
        $label.children('span').text(defaultValue);
      }

      if (files.length > 0) this.processFiles(files);

    },

    dragOver: function(e) {
      e.preventDefault();
      this.$el.find('.file-drop').addClass('hover');
    },

    dragOff: function() {
      this.$el.find('.file-drop').removeClass('hover');
    },

    filesDropped: function(e) {
      e.preventDefault();
      e.stopPropagation();

      var files = e.originalEvent.dataTransfer.files;

      this.$el.find('.file-drop').removeClass('hover').addClass('loading');
      this.processFiles(files);
    },

    processFiles: function(files) {

      this.errors = false;
      this.$el.find('.messages').text('');

      var self = this;
      var promises = [];
      var output = [];
      var error;

      // Process each file, return a promise
      _.each(files, function(file) {
        var reader = new FileReader();
        var name = file.name;
        var deferred = $.Deferred();

        // Check the file extension
        var ext = name.indexOf('.') > -1 ? name.split('.').slice(-1) + '' : 'unknown';
        if (self.supported.indexOf(ext) < 0) {
          if (ext !== 'unknown') ext = '.' + ext;
          app.alerts.error('Filetype ' + (file.type || ext) + ' not suported');
          self.$el.find('.file-drop').removeClass('loading');
          error = true;
          return deferred.reject();
        }

        reader.onload = function(e) {
          var data = e.target.result;
          var workbook = XLSX.read(data, { type: 'binary' });
          
          workbook.SheetNames.forEach(function(sheetName) {
            var sheet = workbook.Sheets[sheetName];
            var json = XLSX.utils.sheet_to_json(sheet);
            var parsed = self.processData(json, sheet);
            output.push(parsed);
          });

          return deferred.resolve();
        };

        reader.readAsBinaryString(file);
        promises.push(deferred);
      });

      if (error) return false;

      // When all files are done processing, validate all data
      $.when.apply($, promises).then(function() {
        self.validateAll(output);
      });
    },

    invalidate: function(message) {
      var error = new Error();
      var msg = message;

      this.displayErrorMessage(msg);

      error.message = msg;
      throw(error);
      // return null;
    },

    processData: function(_input, sheet) {
      var self = this;
      var output = {};

      // remove the header row
      _input = _input.slice(1);

      var currentLayer = 0;
      var currentUnit = 0;
      var currentTenant = 0;

      var invalidKeys = [];

      _input.forEach(function(row, index) {

        // figure out what type of model it is
        var type = self.getModelType(row);
        if (!type) app.alerts.warn('Your data is not formatted correctly');

        // format data
        switch(type) {
            
          case 'property':
            if (output.length > 0) currentLayer = 0;

            currentLayer = 0;
            currentUnit = 0;
            currentTenant = 0;

            var property = {};

            for (var key in row) {
              switch(key) {
                case 'Address':

                  // 533 Washington St, Boston, MA 02111, USA
                  var raw = row[key];
                  var address = raw.split(',');

                  address = address.map(function(x) {
                    return $.trim(x);
                  });

                  try {
                    property.address = address[0];
                    property.city = address[1];
                    property.state = address[2].split(' ')[0];
                    property.zip = address[2].split(' ')[1];
                    property.country = address[3] || 'USA';
                  } catch(e) {
                    self.invalidate('Invalid address: ' + raw);
                  }
                    
                  break;
                
                case 'Name':
                  property.name = row[key];
                  break;
                default:
                  var error = {};
                  var value = key + '';
                  var location = self.getLocation(key, sheet);
                  error[location] = value;
                  invalidKeys.push(error);
                  break;
              }
              output = property;
            }
            break;
          case 'unit_lease':
            // if this is the first unit of the property
            if (currentLayer === 0) {
              currentLayer++;
              output.units = [];
            } else {
              currentLayer = 1;
              currentUnit++;
            }
            currentTenant = 0;

            var unit = { leases: [{}] };

            for (key in row) {
              // Unit data
              switch (key) {
                case 'Number':
                  unit.number = row[key];
                  break;
                case 'Beds':
                  unit.beds = row[key];
                  break;
                case 'Baths':
                  unit.baths = row[key];
                  break;
                case 'Sq Ft':
                  unit.sq_ft = row[key];
                  break;
                case 'Rent':
                  unit.rent = app.utils.parseMoney(row[key]);
                  unit.leases[0].rent = app.utils.parseMoney(row[key]);
                  break;

                // Lease data
                case 'Start Date':
                  unit.leases[0].start_date = row[key];
                  break;
                case 'End Date':
                  unit.leases[0].end_date = row[key];
                  break;
                case 'First Month':
                  unit.leases[0].first_month = '-' + app.utils.parseMoney(row[key]);
                  break;
                case 'Last Month':
                  unit.leases[0].last_month = '-' + app.utils.parseMoney(row[key]);
                  break;
                case 'Security':
                  unit.leases[0].security = app.utils.parseMoney(row[key]);
                  break;
                default:
                  var error = {};
                  var value = key + '';
                  var location = self.getLocation(key, sheet);
                  error[location] = value;
                  invalidKeys.push(error);
                  break;
              }
            }
            output.units.push(unit);
            break;
          case 'tenant':
            // if this is the first tenant on the lease
            if (currentLayer == 1) {
              currentLayer++;
              output.units[currentUnit].leases[0].tenants = [];
            }

            var tenant = {};

            for (key in row) {
              // Unit data
              switch (key) {
                case 'First Name':
                  tenant.first_name = row[key];
                  break;
                case 'Last Name':
                  tenant.last_name = row[key];
                  break;
                case 'Phone':
                  tenant.phone = app.utils.validateContact(row[key], true)['phone'];
                  break;
                case 'Email':
                  tenant.email = row[key];
                  break;
                default:
                  var error = {};
                  var value = key + '';
                  var location = self.getLocation(key, sheet);
                  error[location] = value;
                  invalidKeys.push(error);
                  break;
              }
            }
            output.units[currentUnit].leases[0].tenants.push(tenant);
            // output.units[currentUnit].leases.length;
            break;
          default:
            // this should never run
            console.warn(row, index);
            console.warn('a row of bad data was found');
            break;
        }
      });

      // print errors in view 
      if (invalidKeys.length > 0) {
        console.warn(invalidKeys);
        var keyErrors = this.parseKeyErrors(invalidKeys);
        this.displayKeyErrors(keyErrors);
        return false;
      }

      console.log(output)

      // if there are units, make sure to clean up lease data
      if (output.units) {
        output.units.forEach(function(x, i) {

          // lol omg
          output.units[i].leases = output.units[i].leases.filter(function(x, i) {
            return _.isEmpty(x) ? false : x;
          });
          if (output.units[i].leases.length < 1) {
            delete output.units[i].leases;
          }
        });
      }

      return output;
    },

    parseKeyErrors: function(error_array) {
      var stringified = error_array.map(function(x) {
        return JSON.stringify(x);
      });
      var output = _.uniq(stringified);
      output = output.map(function(x) {
        return JSON.parse(x);
      });
      return output;
    },

    displayMessage: function(message, data) {
      var $message = $('<div class="success"></div>');
      $message.text(message);
      var $messages = this.$el.find('.messages');
      $messages.append($message);
    },

    displayErrorMessage: function(errors, data) {
      var self = this;
      var errorMessage = '';

      this.$el.find('.file-drop').removeClass('loading');

      if (typeof errors == 'object') {
        for (var error in errors) {
          if (data) {
            var html = $('<div class="error"><pre></pre></div>');
            html.children('pre').text(JSON.stringify(data, undefined, 2));
            self.$el.find('.messages').append(html);
          }
          if (error == 'message') {
            errorMessage = errors[error];
          } else {
            errorMessage = error + ': ' + errors[error];
          }
        }
      } else {
        errorMessage = errors;
      }

      var $error = $('<div class="error strong">' + errorMessage + '</div>');

      self.$el.find('.messages').append($error);
    },

    displayKeyErrors: function(keyErrors) {
      var self = this;
      //this.$el.find('.messages').html('');

      this.$el.find('.file-drop').removeClass('loading');

      keyErrors.forEach(function(x) {
        var errorMessage = '';
        for (var key in x) {
          errorMessage += 'Invalid key "' + x[key] + '"" at ' + key;
        }
        self.$el.find('.messages').append($('<div class="error">' + errorMessage + '</div>'));
      });
    },

    /**
     * Find a value within an object and return the key, for data import only
     * 
     * @param  {string} value   [value to search for]
     * @param  {object} object  [object to search]
     * @return {string}         [key that contains value]
     */
    
    findVal: function(value, object) {
      for (var key in object) {
        if (typeof object[key] == 'object') {
          if (object[key]['h'] == value) return key;
        }
      }
    },

    getLocation: function(value, sheet) {
      return this.findVal(value, sheet);
    },

    getModelType: function(object) {

      if (this.propertyFields.some(function(v) { return (v in object) } )) {
        return 'property';
      } else if (this.unitFields.some(function(v) { return (v in object) } )) {
        return 'unit_lease';
      } else if (this.tenantFields.some(function(v) { return (v in object) } )) {
        return 'tenant';
      } else {
        return false;
      }
    },

    validateAll: function(data) {
      var self = this;

      // check each sheet to see if any didn't pass
      var parseCheckAll = true;
      data.forEach(function(x) {
        if (!x) parseCheckAll = false;
      });
      if (!parseCheckAll) return false;

      // all sheets passed, show message and send data
      this.displayMessage('Data parsed successful, validating...');

      // begin validation

      data = data.map(function(property) {

        // var propertyData = _.omit(property, 'units');
        self.validateModel(property, 'property');


        if (property.units) {
          property.units = property.units.map(function(unit) {

            // var unitData = _.omit(unit, 'leases');
            unit = self.validateModel(unit, 'unit');

            if (unit.leases) {
              unit.leases = unit.leases.map(function(lease) {
                
                // var leaseData = lease;
                lease = self.validateModel(lease, 'lease');

                if (lease.tenants) {
                  lease.tenants = lease.tenants.map(function(tenant) {
                    
                    // var tenantData = tenant;
                    self.validateModel(tenant, 'tenant');
                    return tenant;
                  });
                }
                return lease;
              });
            }
            return unit;
          });
        }
        return property;
      });
      
      if (this.errors) return false;

      this.data = data;

      var delay = setTimeout(function() {
        self.displayMessage('Validation successful, processing...');
      }, 700);

      this.verifyData();
    },

    validateModel: function(_data, _modelName) {
      var model;

      switch (_modelName) {
        case 'property':
          model = new PropertyModel();
          break;
        case 'unit':
          model = new UnitModel();
          _.extend(model.validation, {
            property: {
              required: false
            }
          });
          break;
        case 'lease':
          model = new LeaseModel();
          _.extend(model.validation, {
            unit: {
              required: false
            }
          });
          break;
        case 'tenant':
          model = new TenantModel();
          break;
      }

      var data = app.schema.process(_data, model);

      model.set(data);
      _.extend(model, Backbone.Validation.mixin);

      // model.validate() returns an object of errors, or false
      var validation_errors = model.validate();

      if (validation_errors) {
        this.errors = true;
        this.displayErrorMessage(validation_errors, _data);
        delete model;
        return false;
      } else {
        // if data validated successfully
        // overwrite the original data with processed data

        console.log(data);

        this.queue[_modelName].push(model);
        delete model;
        return data;
      }
    },

    // render the queue of models to verify all data before sending to server
    verifyData: function() {
      var self = this;

      if (this.queue.length === 0) {
        this.displayErrorMessage({
          queue_empty: 'No data in queue'
        });
        return;
      }

      var queue = this.queue;

      for (var type in queue) {
        console.log(type, queue[type]);

        var length = queue[type].length;
        var model = length === 1 ? type : app.utils.modelNames(type, true);
        var message = length + ' ' + model;
        var data = [];
        queue[type].forEach(function(x) {
          data.push(JSON.stringify(x.toJSON(), undefined, 2));
        });

        this.displayMessage(message, data.join(', '));
      }

      var delay = setTimeout(function() {
        self.$el.find('.file-drop').removeClass('loading');
        self.$el.find('.import').fadeOut(600, function() {
          self.$el.addClass('processed');
          self.showSummary();
        });
        clearTimeout(delay);
      }, 1200);
    },

    promptSave: function() {
      var target = 'test';
      var message = 'Are you sure you want to import ' + target + '?';

      app.controls.modalConfirm(message, 'confirmSave', this);
    },

    submitData: function() {
      app.controls.loadLock(true);

      console.log(this.data);

      this.sendData({
        data: this.data, 
      }).then(function() {
        console.log(arguments);

        app.controls.loadLock(false);
        app.router.navigate('properties', { trigger: true });
        app.alerts.success('Data imported successfully!');
      }).fail(function(error) {
        console.warn(arguments);
        app.alerts.error('Could not import data');
        app.controls.loadLock(false);
      });
    },

    sendData: function(options, callback) {
      return app.utils.request({
        path: 'import',
        method: 'POST',
        data: options.data,
        refresh: true
      }, callback);
    },

    showSummary: function() {
      this.$el.find('.summary-table').html(this.template_summary({ 
        properties: this.data 
      }));
    },

    resetView: function() {
      delete this.data;

      var self = this;
      this.$el.find('.messages').html('');
      this.$el.removeClass('processed');

      this.$el.find('form')[0].reset();
      this.filesChosen();

      var delay = setTimeout(function() {
        self.$el.find('.summary-table').html('');
        self.$el.find('.import').fadeIn(600);
        clearTimeout(delay);
      }, 600);
      
    }

  });
});