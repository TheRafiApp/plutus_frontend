/**
 * ModalLeaseView.js
 */

define([
  'app',
  'kalendae',
  'view/modals/ModalView',
  'model/leases/LeaseModel',
  'view/repeaters/charge',
  'collection/users/TenantsCollection',
  'text!templates/modals/modal-lease.html'
],
function(
  app,
  kalendae,
  ModalView,
  LeaseModel,
  ChargeRepeater,
  TenantsCollection,
  ModalLeaseTemplate
) {

  return ModalView.extend({

    'events': {
      // 'keyup': 'keyControl',
      // 'click .action-confirm': 'saveModel',
      // 'click .action-cancel': 'closeModal',
      'click .action-add-recurring': 'addRecurring',
      'click .action-add-scheduled': 'addScheduled',
      'click .overlay': 'easyClose',
      'change select.type': 'typeChange',
      'keyup .bill_due_day': 'updateOrdinal',
      'change #first': 'toggleFirst',
      'change #last': 'toggleLast',
      'keyup input.rent': 'rentChanged',
    },

    title: function() {
      return this.action + ' Lease';
    },

    template: _.template(ModalLeaseTemplate),

    recurring_charges: [],
    scheduled_charges: [],

    start_moment: false,
    end_moment: false,

    tenants: new TenantsCollection(),

    hasTouch: app.utils.hasTouch(),

    // keyControl: function(e) {
    //   if (app.utils.getFocused().parentNode.className.contains('actions')) return;
    //   // esc
    //   if (e.which === 27) {
    //     this.easyClose();
    //   // enter
    //   } else if (e.which === 13) {
    //     this.saveModel();
    //   }
    // },

    initialize: function(_options) {
      if (_options) _.extend(this, _options);
      if (!this.action) this.action = 'add';

      var self = this;

      // Unit & property
      this.unit = this.context.model;
      this.parentModelId = this.context.parentModelId;

      // Leases on the unit
      this.leases = this.context.leases;

      // TODO: this is to allow for lease creation via /leases, without a unit picked
      if (this.parentModelId) {
        this.property = app.collections.currentCollection.get({ _id: this.parentModelId });
      }

      // If it's a new lease
      if (!this.model) this.model = new LeaseModel();

      // Bind validation
      // Backbone.Validation.bind(this);

      // Set as active modal
      // app.views.modalView = this;
      // app.views.appView.trigger('modalOpened');

      // Event listener for opening calendars
      this.on('calendar-open', this.calendarOpen, this);

      // Get tenants collection
      this.tenants.fetch().then(function() {
        self.renderModalView();
      });

    },

    calendarOpen: function() {
      var $calendar = this.$el.find('.kalendae-input-open');
      var $input = $calendar.siblings('input');
      var $container = this.$el.find('.content');
      var scroll = $container.scrollTop();

      // bypass repeater field groups
      var offset = $calendar.closest('.field-group:not(.bypass)').position();

      var container_height = $container.outerHeight();
      var parent_height = $calendar.parent().outerHeight();
      var calendar_height = $calendar.outerHeight();
      var group_height = parent_height + calendar_height;

      // position of bottom of elements relative to scroll container
      var container_bottom = scroll + container_height;
      var calendar_bottom = group_height + offset.top;

      // calendar is offscreen
      if (calendar_bottom > container_bottom) {
        $container.scrollTop(offset.top);
        // timeout because of race condition with kalendae blur event
        app.controls.wait(20).then(function() {
          $input.focus();
        });
      }
    },

    render: function() {
      var self = this;

      var tenants = this.tenants.toJSON();

      if (app.session.isSuperAdmin()) {
        var company_id = this.property.get('company');
        tenants = JSON.parse(JSON.stringify(this.tenants.where({ company: company_id })));
      }

      // Action specific data

      var start_date;
      var end_date;
      var selected_tenants = false;
      var last_month_passed = false;

      var first_month = this.model.get('first_month');
      var last_month = this.model.get('last_month');

      switch(this.action) {
        case 'add':
          start_date = moment.utc().add('months', 1).startOf('month').startOf('day'); // next first of the month
          end_date = moment.utc().add('months', 12);
          break;
        case 'edit':
          start_date = this.model.get('start_moment'); // existing lease

          // if is active, use today, if in the future, do something else
          end_date = this.model.get('end_moment');

          // if m2m
          if (!end_date) {
            if (this.model.get('isActive')) {
              end_date = moment.utc();
            } else {
              end_date = moment.utc(start_date).add('months', 12).subtract('days', 1);
            }
          }

          selected_tenants = new TenantsCollection(this.model.get('tenants')).pluck('_id');
          break;
        case 'renew':
          start_date = this.model.get('end_moment').add('days', 1); // existing lease end date +1 day
          end_date = moment.utc(start_date).add('months', 12).subtract('days', 1);
          selected_tenants = new TenantsCollection(this.model.get('tenants')).pluck('_id');

          // TODO: This is not the place for this
          // determine last month's rent situation

          if (last_month) {
            var last_month_date = moment.utc(last_month.date);
            var today = moment.utc();

            // if the paid last month is already being used
            if (today > last_month_date) {
              last_month_passed = true;
            }
          }
      }

      this.ready({
        action: app.utils.capitalize(this.action),
        unit: this.unit.toJSON(),
        property: this.property.toJSON(),
        tenants: tenants,
        selected_tenants: selected_tenants,
        last_month_passed: last_month_passed,
        first_month: first_month,
        last_month: last_month
      });

      // Date fields

      var $start_field = this.$el.find('#start_date');
      var $end_field = this.$el.find('#end_date');

      // Format lease data

      var fixed_term = [];
      var month_to_month = [];

      // Convert datestrings to date objects

      _.each(this.leases, function(lease) {
        lease.start_date = moment.utc(lease.start_date);
        if (lease.type == 'fixed_term') {
          lease.end_date = moment.utc(lease.end_date);
          fixed_term.push(lease);
        } else {
          month_to_month.push(lease);
        }
      });

      // Init Kalendae

      if (!this.hasTouch) {
        this.start_date = new Kalendae.Input($start_field[0], {
          months: 1,
          selected: start_date,

          blackout: function(date) {
            return self.blackout(date, fixed_term);
          },

          rangeClass: function(date) {
            return self.rangeClass(date, month_to_month);
          }
        });

        this.end_date = new Kalendae.Input($end_field[0], {
          months: 1,
          mode: 'range',
          rangeLock: true,
          direction: 'select-future',
          selected: [start_date, end_date], // reverting to the first array element bug

          blackout: function(date) {
            return self.blackout(date, fixed_term);
          },
          rangeClass: function(date) {
            return self.rangeClass(date, month_to_month);
          }
        });

        // Start Date event listeners

        this.start_date.subscribe('change', function() {
          self.typeChange();
        });
        this.start_date.subscribe('show', function() {
          self.trigger('calendar-open');
        });

        // End Date event listeners

        this.end_date.subscribe('change', function(date) {
          self.endChange();
        });
        this.end_date.subscribe('show', function() {
          self.trigger('calendar-open');
        });
      } else {
        // has touchstart
        this.start_date = $start_field;
        this.end_date = $end_field;

        this.start_date.attr('type', 'date').val(start_date.format('YYYY-MM-DD'));
        this.end_date.attr('type', 'date').val(end_date.format('YYYY-MM-DD'));

        this.start_date.on('change', $.proxy(this.typeChange, this));

        this.end_date.on('change', function() {
          // var date = moment.utc(self.end_date.val());
          $.proxy(self.endChange(), self);
        });
      }

      this.typeChange();

      // Have to set up these listeners after rendering the calendars

      this.$el.find('input').change($.proxy(this.formChanged, this));
      this.$el.find('select').change($.proxy(this.formChanged, this));

      // Add charges that exist

      if (this.action != 'add') {
        var charges = this.model.get('charges');
        var recurring = charges.recurring;
        recurring.forEach(function(charge) {
          if (charge.type != 'rent') self.addRecurring(null, charge.amount);
        });

        if (this.action != 'renew') {
          var scheduled_charges = charges.scheduled;
          scheduled_charges.forEach(function(charge) {
            if (['fee', 'credit'].contains(charge.type)) self.addScheduled(null, charge.amount, charge.date);
          });
        }
      }

      // Mask money inputs

      this.$el.find('.bill_due_day').mask('00');
      this.$el.find('.rent, .first_month, .last_month').mask('zzzzzzz', {
        translation: {
          'z': {
            pattern: /[0-9\.]/
          }
        }
      });

      // Show modal

      // $('.modal-container').html(this.$el).addClass('visible');

      // app.utils.prepInputs(this);

      // Init Chosen

      // this.$el.find('.chosen').chosen({ disable_search: true });
      // this.$el.find('.chosen-multiple').chosen();

      return this;
    },

    blackout: function(date, leases) {
      date = moment.utc(date);
      var check = false;
      leases.every(function(lease) {
        var start = lease.start_date;
        var end = lease.end_date;
        var conflict = start <= date && date <= end;
        if (conflict) {
          check = true;
          return false;
        } else {
          return true;
        }
      });
      return check ? true : false;
    },

    rangeClass: function(date, leases) {
      var check = true;
      leases.every(function(lease) {
        var start = lease.start_date;
        var selected = self.start_moment;
        var conflict;
        if (selected) {
          if (selected > start) {
            conflict = start <= date && date < selected;
          } else {
            conflict = date >= start;
          }
        } else {
          conflict = date >= start;
        }
        if (conflict) {
          check = false;
          return false;
        } else {
          return true;
        }
      });
      return check ? false : 'k-month-to-month';
    },

    // user changed rent value
    rentChanged: function() {
      var rent = this.$el.find('.rent').val();
      if (rent) {
        this.toggleFees(true);
      } else {
        this.toggleFees(false);
      }
    },

    updateDueDay: function() {
      var day = this.$el.find('.bill_due_day');
      var start;

      if (!app.utils.hasTouch()) {
        start = this.start_date.getSelectedRaw()[0];
      } else {
        start = moment.utc(this.start_date.val());
      }

      if (!start) return;

      start = start.format('D');

      var due_date = start > 28 ? 28 : start;
      day.val(due_date);
      this.updateOrdinal();
    },

    updateOrdinal: function() {
      var $day = this.$el.find('.bill_due_day');
      var day = $day.val();
      var due_date;
      if (day > 28) {
        due_date = 28;

        app.controls.fieldError({
          element: $day,
          message: 'Billing date must be a day that is shared by all months in the year'
        });
        // $day.closest('.field-group').addClass('has-message').find('.help-text').html('Billing date must be a day that is shared by all months in the year');
      } else {
        due_date = day;
      }
      $day.val(due_date);
      var ordinal = app.utils.getOrdinal(due_date);
      this.$el.find('#ordinal').html(ordinal);
    },

    // toggle a single fee
    toggleFee: function($checkbox, boolean) {
      var $fee_input = $checkbox.siblings('.money').children('input');
      if (boolean) {

        if ($checkbox.prop('checked')) {
          var rent = this.$el.find('.rent').val();
          $fee_input.val(rent);
          $fee_input.prop('disabled', false);
        }

      } else {
        $fee_input.prop('disabled', true);
        $fee_input.val('0.00');
      }
    },

    // if rent field is empty, disble fee fields
    toggleFees: function(boolean, selector) {
      var self = this;

      // may pass a selector to target a single field
      if (typeof selector == 'undefined') selector = '';
      var $fees = this.$el.find('.fee' + selector);

      if (boolean) {
        $fees.find('.toggle').prop('disabled', false);
        var rent = this.$el.find('.rent').val();

        _.each($fees, function($fee) {
          self.toggleFee($($fee).children('.toggle'), true);

          if ($($fee).children('.toggle').prop('checked') === true) {
            $($fee).children('.money input').val(rent);
          }
        });

      } else {
        this.toggleFee($fees.children('.toggle'), false);
        $fees.find('.toggle').prop('disabled', true);
        $fees.find('.toggle').prop('checked', false);
      }
    },

    // redundant toggle methods since I can't pass an argument with bb events
    toggleFirst: function() {
      var $checkbox = this.$el.find('#first');
      var boolean = $checkbox.prop('checked') ? true : false;

      this.toggleFee($checkbox, boolean);
    },

    toggleLast: function() {
      var $checkbox = this.$el.find('#last');
      var boolean = $checkbox.prop('checked') ? true : false;

      this.toggleFee($checkbox, boolean);
    },

    endChange: function() {
      var start;
      var end;
      if (!this.hasTouch) {
        start = this.start_date.getSelectedRaw()[0];
        end = this.end_date.getSelectedRaw()[1];
      } else {
        start = moment.utc(this.start_date.val());
        end = moment.utc(this.end_date.val());
      }
      if (!end) return;

      // add back on that day we subtracted
      end = moment(end).add('days', 1);

      // get the duration in months
      var length = moment.duration(start.diff(end)).asMonths();
      // make sure its positive and round
      length = Math.abs(Math.round(length));

      var selection;

      // check if the duration is 12 or 6 or custom
      if ([12, 6].contains(length)) {
        selection = length;
      } else {
        selection = 'custom';
      }

      // set selection
      var $select = this.$el.find('select.type');
      $select.val(selection).trigger('chosen:updated');

    },

    typeChange: function() {
      var lease_type = this.$el.find('select.type').val();
      var endNeeded = true;

      if (!this.hasTouch) {
        this.start_moment = this.start_date.getSelectedRaw()[0];
        this.end_moments = this.end_date.getSelectedRaw();
      } else {
        this.start_moment = moment.utc(this.start_date.val());
        this.end_moments = moment.utc(this.end_date.val());
      }

      if (this.action == 'edit') return;

      var $start_field = this.$el.find('#start_date');
      var $end_field = this.$el.find('#end_date');

      $start_field.parent().removeClass('has-error').children('.help-text').text('');
      $end_field.parent().removeClass('has-error').children('.help-text').text('');

      // 12 month lease
      var incremented;

      if (lease_type == 12) {

        incremented = moment.utc(this.start_moment).add('months', lease_type).subtract('days', 1);
        $end_field.prop('disabled', false);

        this.rentChanged();

      // 6 month lease
      } else if (lease_type == 6) {

        incremented = moment.utc(this.start_moment).add('months', lease_type).subtract('days', 1);
        $end_field.prop('disabled', false);

      // Month to month lease
      } else if (lease_type == 'month-to-month') {

        $end_field.attr('type', 'text');
        $end_field.val('N/A');
        $end_field.prop('disabled', true);

        endNeeded = false;

        this.toggleFees(false, '.last-month');

      // Custom duration
      } else if (lease_type == 'custom') {

        if (!this.hasTouch) {
          if (this.end_date.getSelectedRaw().length > 1) {
            incremented = this.end_date.getSelectedRaw()[1];
          }
        } else {
          incremented = moment.utc(this.end_date.val());
        }
        $end_field.prop('disabled', false);
      }

      if (endNeeded) {
        if (!this.hasTouch) {
          this.end_date.setSelected([this.start_moment, incremented]);
        } else {
          $end_field.attr('type', 'date');
          this.end_date.val(incremented.format('YYYY-MM-DD'));
        }
      }

      this.updateDueDay();
      this.validateSpan();
    },

    validateSpan: function() {
      var self = this;
      var start_date;
      var end_date;

      if (!this.hasTouch) {
        if (this.end_date.getSelectedRaw().length < 2) return false;

        start_date = this.start_date.getSelectedRaw()[0];
        end_date = this.end_date.getSelectedRaw()[1];
      } else {
        start_date = moment.utc(this.start_date.val());
        end_date = moment.utc(this.end_date.val());
      }

      if (!this.leases) return;

      this.leases.forEach(function(lease) {
        if (lease.start_date <= start_date && start_date <= lease.end_date) {
          app.controls.fieldError({
            element: '#start_date',
            error: 'Overlapping lease conflict'
          });
        }
        if (lease.start_date <= end_date && end_date <= lease.end_date) {
          app.controls.fieldError({
            element: '#end_date',
            error: 'Overlapping lease conflict'
          });
        }
      });
    },

    constructData: function() {
      var $form = this.$el.find('form');

      // make sure the charges property is always in the data
      var charges = {
        recurring: [],
        scheduled: []
      };

      var formData = $form.serializeObject();

      // inject default charges
      charges = _.extend(charges, formData.charges);
      formData.charges = charges;

      // Set unit
      formData.unit = this.unit.id;

      // Set first, last month's rent
      var $first = this.$el.find('#first');
      var $last = this.$el.find('#last');
      var amount;

      if ($first.prop('checked')) {
        amount = $first.siblings('.money').children('input').val();
        formData.charges.scheduled.push({
          type: 'first_month',
          amount: '-' + app.utils.parseMoney(amount)
        });
      }

      if ($last.prop('checked')) {
        amount = $last.siblings('.money').children('input').val();
        formData.charges.scheduled.push({
          type: 'last_month',
          amount: '-' + app.utils.parseMoney(amount)
        });
      }

      // if existing lease and autopay is active
      if (this.action == 'renew') {
        formData.renewed_lease_id = this.model.get('_id');
        var autopay = this.model.get('autopay')
        if (autopay) {
          formData.autopay = autopay
        }
      }

      formData = app.schema.process(formData, this.model);

      // if (!app.utils.validate(this, formData)) return false;

      if (this.action == 'edit') {
        delete formData.rent;
        delete formData.start_date;
        delete formData.unit;
        delete formData.lease;

        // save first and last
        var original_charges = this.model.get('charges.scheduled');

        original_charges.forEach(function(charge) {
          if (['first_month', 'last_month'].indexOf(charge.type) > -1) {
            formData.charges.scheduled.push(charge);
          }
        });
      }

      console.log(formData);

      return formData;

    },

    confirm: function() {
      var self = this;

      var formData = this.constructData();

      var validate = app.utils.validate(this, formData);

      if (!validate) return false;
      // HACK: make sure only changed data gets sent

      if (!this.model.isNew()) {
        // this.model = this.model.clone();

        var tenants = this.model.get('tenants');
        var tenants_array = [];

        tenants.map(function(tenant) {
          tenants_array.push(tenant._id);
        });

        this.model.set('tenants', tenants_array);
      }

      app.controls.loadLock(true);

      this.model.save(formData).always(function() {
        app.controls.loadLock(false);
      }).then(function() {
        self.context.trigger(self.eventName);
        self.closeModal();
        app.alerts.success(self.messages.success);
      }).fail(function(error) {
        self.handleError(error);
      });
    },

    handleError: function(e) {
      var error;
      var message;

      if (e.responseJSON && e.responseJSON.error == 'datespan_overlap') {
        error = e.responseJSON;
        message = error.message;
        var existing_lease = error.data.existing_lease;
        var start_date = existing_lease.start_date;
        var end_date = existing_lease.end_date;

        app.alerts.error(message + ': ' + start_date + ' – ' + end_date);
      }
    },


    recurringCounter: 0,

    addRecurring: function(event, amount) {
      if (!amount) amount = false;
      var recurring_charge = new ChargeRepeater({
        options: {
          type: true,
          description: true
        },
        type: 'recurring',
        name: 'charges.recurring',
        amount: amount,
        id: this.recurringCounter++,
        indexKey: 'recurringCounter',
        context: this,
        min: 0
      });

      this.recurring_charges.push(recurring_charge);
      this.$el.find('.recurring').append(recurring_charge.$el);
    },

    scheduledCounter: 0,

    addScheduled: function(event, amount, date) {
      if (!amount) amount = false;
      if (!date) date = false;
      var scheduled_charge = new ChargeRepeater({
        options: {
          type: true,
          description: true
        },
        type: 'scheduled',
        name: 'charges.scheduled',
        amount: amount,
        date: date,
        context: this,
        id: this.scheduledCounter++,
        indexKey: 'scheduledCounter',
        min: 0
      });

      this.scheduled_charges.push(scheduled_charge);
      this.$el.find('.scheduled').append(scheduled_charge.$el);
    },

    easyClose: function() {
      if (!this.changed) {
        this.closeModal();
      } else {
        app.controls.modalShake(this);
      }
    },

    formChanged: function() {
      this.changed = true;
    }

  });
});
