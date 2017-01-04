/**
 * account/onboarding/split.js
 */

define([
  'app',
  // 'd3',
  // 'c3',
  'view/cards/user_payments',
  'model/users/TenantModel',
  'model/leases/MyLeaseModel',
  'text!templates/account/activate/split.html',
],
function(app, UserCardView, TenantModel, LeaseModel, OnboardingTemplate) {

  return Backbone.View.extend({

    className: 'split',
    template: _.template(OnboardingTemplate),

    events: {
      'click .action-next': 'handleClick',
      'change .split-amount': 'validateSplit' 
    }, 

    initialize: function(options) {
      if (options) _.extend(this, options);

      this.on('confirmSplit', this.nextStep, this);
      this.render();
    },

    render: function() {
      var self = this;

      this.user = this.parentView.user.toJSON();

      var lease = this.step.lease;
      var suggested_split = lease.rent / (lease.tenants.length);
      
      this.model = new LeaseModel(lease);

      this.$el.html(this.template({
        logo: app.templates.logo(),
        total: app.utils.prettyMoney(lease.rent),
        split: suggested_split
      }));

      this.renderChart();

      app.controls.maskMoney('.money input', this, 7);

      this.getFundingSources();

      return this;
    },

    getFundingSources: function() {
      var self = this;

      var primary = this.parentView.user.get('dwolla.primary_funding_source');

      var path = app.session.get('logged_in') ? 'account' : 'tenants/activate';
      app.utils.request({
        path: path + '/funding_sources',
        method: 'GET'
      }).then(function(response) {
        self.primary = response.find(function(funding_source) {
          return funding_source.id === primary;
        });
      }).fail(function(err) {
        console.warn(err);
      });
    },

    getSplitData: function(splitInput) {
      var lease = this.model.clone().toJSON();
      // var my_name = this.user.first_name + ' ' + this.user.last_name[0];
      var my_name = this.user._id;
      var split = lease.split || {};

      // this endpoint doesn't include split on tenant...
      lease.tenants = lease.tenants.map(function(tenant) {
        if (split[tenant._id]) tenant.split = split[tenant._id];
        return tenant;
      });

      // get tenants who have split set up
      var existing_splits = lease.tenants.filter(function(tenant) {
        return typeof tenant.split !== 'undefined';
      }).map(function(tenant) {
        return {
          // name: tenant.first_name + ' ' + tenant.last_name[0],
          name: tenant._id,
          split: tenant.split
        };
      });

      // get number of tenants without split
      var missing_splits = lease.tenants.length - existing_splits.length;
      // console.log('missing: ' + missing_splits)
      
      // tally up how much rent is account for
      var rent_covered = existing_splits.map(function(tenant) {
        return tenant.split;
      }).reduce(function(a, b) {
        return a + b;
      }, 0);

      var suggested_split;

      var calculated_suggestion = missing_splits ? ((lease.rent - rent_covered) / missing_splits) : 0;
      // if argument for split was passed, include that for current user 
      if (splitInput) {
        suggested_split = parseFloat(splitInput);
      } else {
        suggested_split = calculated_suggestion;
      }

      // not sure if i really need to check for this
      var is_user_set = lease.split && lease.split.hasOwnProperty(this.user._id);

      if (!is_user_set) {
        existing_splits.push({
          name: my_name,
          split: suggested_split
        });
      } else if (splitInput) {
        existing_splits = existing_splits.map(function(split) {
          if (split.name == my_name) split.split = suggested_split;
          return split;
        });
      }

      // tally up how much rent is account for
      // var rent_covered = existing_splits.map(function(tenant) {
      //   return tenant.split;
      // }).reduce(function(a, b) {
      //   return a + b;
      // }, 0);

      // how much rent is unaccounted for
      var missing_rent = lease.rent - rent_covered;
      if (missing_rent < 0) missing_rent = 0;

      // console.log('already covered: ' + rent_covered, 'rent missing: ' + missing_rent)

      // tally splits up with new user suggested split
      var new_total = existing_splits.map(function(tenant) {
        return tenant.split;
      }).reduce(function(a, b) {
        return a + b;
      }, 0);

      // using the new suggested split, what is left?
      var remaining = lease.rent - new_total;

      // check if this exceeds rent
      if (remaining < 0) {
        this.$el.find('.split-amount').val(missing_rent);
        this.updateChart(missing_rent);
        return false;
      }

      // console.log('new total: ' + new_total);
      // console.log('suggested: ' + suggested_split + ' each')

      // should i be checking for this?
      if (missing_rent) {
        existing_splits.push({
          name: 'Remaining',
          split: remaining
        });
      }

      // console.log(existing_splits)

      // format data for C3
      var split_data = {};
      var keys = [];

      existing_splits.forEach(function(e) {
        keys.push(e.name);
        split_data[e.name] = e.split;
      });

      var my_split = split_data[my_name];

      this.$el.find('.split-amount').val(app.utils.parseMoney(my_split));

      return {
        data: split_data,
        keys: keys
      };
    },

    renderChart: function(splitInput) {
      var self = this;
      var tenants = $.extend(true, [], this.model.get('tenants'));
      var my_id = this.user._id;

      this.cards = {};

      var split_data = this.getSplitData(splitInput);

      console.log(split_data)

      // put self first in array
      tenants = tenants.sort(function(a, b) {
        if (a.split) {
          return -1;
        } else {
          return 1;
        }
      }).sort(function(a, b) {
        if (a._id === my_id) {
          return -1;
        } else if (b._id === my_id) {
          return 1;
        }
      });

      // add new split data to array
      tenants = tenants.map(function(tenant) {
        tenant.split = split_data.data[tenant._id];
        return tenant;
      });

      // var split = this.model.get('split');

      _.each(tenants, function(tenant) {
        var tenantModel = new TenantModel(tenant);
        self.cards[tenantModel.id] = new UserCardView({ 
          data: tenantModel.toJSON(),
          amount: tenantModel.toJSON().split,
          negative: true
        });

        self.$el.find('.chart').append(self.cards[tenantModel.id].$el);
      });

      var remaining = split_data.data['Remaining'] ? app.utils.prettyMoney(split_data.data['Remaining']) : '$0.00';
      this.$el.find('.remaining').html(remaining);

      this.getSplitData();
    },

    updateChart: function(splitInput) {
      var split_data = this.getSplitData(splitInput);

      var id = this.user._id;

      if (!split_data) return;

      var updatedSplit = app.utils.prettyMoney(split_data.data[id]);
      var updatedRemaining = app.utils.prettyMoney(split_data.data['Remaining'] || 0);

      this.$el.find('.remaining').html(updatedRemaining);
      this.cards[id].$el.find('.transfer-data li').html('-' + updatedSplit);
    },

    handleClick: function() {
      var split_amount = this.$el.find('.split-amount').val();
      var split_data = this.getSplitData(split_amount);

      if (!split_data) return;

      this.updateChart(split_amount);

      if (this.$el.find('#autopay').is(':checked')) {
        this.promptConfirm(split_amount);
      } else {
        this.nextStep();
      }
    },

    validateSplit: function(e) {
      var amount = $(e.currentTarget).val();
      var invalid = app.utils.validateMoney(amount);
      
      if (invalid) {
        e.stopPropagation();
        app.controls.fieldError({
          element: $(e.currentTarget),
          type: 'error',
          error: invalid
        });
      } else {
        this.updateChart(amount);
      }
    },

    promptConfirm: function(split) {
      var due_day = this.step.lease.bill_due_day;
      var message = 'You have opted to autopay your rent amount of ';
      message += app.utils.prettyMoney(split);
      message += ', from your account "';
      message += this.primary.name;
      message += '" to ';
      message += this.parentView.user.get('company.name');
      message += '. Per your lease, you will be charged this amount on the ';
      message += due_day + app.utils.getOrdinal(due_day);
      message += ' of each month.';

      app.controls.modalConfirm(message, 'confirmSplit', this);
    },

    nextStep: function() {
      var self = this;
      var split_data = {
        split: this.$el.find('.split-amount').val(),
        autopay: this.$el.find('#autopay').is(':checked')
      };
      
      var data = app.schema.process(split_data, this.model);

      this.model.save(data).then(function(response) {
        self.parentView.user.set(response);
        self.parentView.next();
      }).fail(function() {
        console.warn(arguments);
      });
    }

    // renderChart: function(splitInput) {
    //   var lease = this.step.lease;

    //   var self = this;
    //   var $chart = this.$el.find('.chart');

    //   var split_data = this.getSplitData(splitInput);

    //   if (!split_data) return;

    //   var myName = this.user.first_name + ' ' + this.user.last_name;

    //   this.chart = c3.generate({
    //     bindto: $chart[0],
    //     data: {
    //       json: [split_data.data],
    //       keys: {
    //         value: split_data.keys
    //       },
    //       type : 'pie',
    //       order: null,
    //       color: function (color, d) {
    //         if (d === 'Remaining') return self.step.options.background;
    //         if (d === myName) return 'rgba(255,255,255, 0.6)';
    //         return '#fff';
    //       }
    //     },
    //     legend: {
    //        show: false
    //     },
    //     pie: {
    //       label: {
    //         format: function(value, ratio, id) {
    //           return id + ': ' + app.utils.prettyMoney(value);
    //         }
    //       },
    //     }
    //   });

    //   // hack to fix invisible chart onload
    //   setTimeout(function() {
    //     self.chart.flush();
    //   }, 10);

    //   var $total = $('<div class="total" />');
    //   var $amount = $('<div class="amount" />').html(app.utils.prettyMoney(lease.rent));

    //   this.$el.find('.chart').append($total.append($amount));
    // },
    // 
    // updateChart: function(split_amount) {
    //   var split_data = this.getSplitData(split_amount);
    //   if (!split_data) return;

    //   this.chart.load({
    //     json: [split_data.data],
    //     keys: {
    //       value: split_data.keys
    //     }
    //   });
    // },

  });
});