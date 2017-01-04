/**
 * ModalSplitView.js
 */

define([
  'app',
  'view/modals/ModalView',
  'view/cards/user_payments',
  'model/users/TenantModel',
  'text!templates/modals/modal-split.html'
],
function(
  app, 
  ModalView, 
  UserCardView, 
  TenantModel, 
  ModalSplitTemplate
) {

  return ModalView.extend({

    className: 'split',

    events: {
      'change .amount': 'validateSplit'
    },

    title: function() {
      return this.action + ' Rent Split';
    },

    template: _.template(ModalSplitTemplate),

    initialize: function(_options) {
      if (_options) _.extend(this, _options);

      this.model = this.context.model;
      this.user = app.session.user.toJSON();

      this.renderModalView();
    },

    render: function() {
      var rent = this.model.get('rent');
      var user_id = app.session.user.id;

      var autopay = this.model.get('autopay')[user_id] === true;

      this.ready({
        total: app.utils.prettyMoney(rent),
        autopay: autopay
      });

      this.renderChart();

      return this;
    },

    getSplitData: function(splitInput) {
      var lease = this.model.clone().toJSON();
      // var my_id = this.user.first_name + ' ' + this.user.last_name[0];
      var my_id = this.user._id;
      var split = lease.split;

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
          name: my_id,
          split: suggested_split
        });
      } else if (splitInput) {
        existing_splits = existing_splits.map(function(split) {
          if (split.name == my_id) split.split = suggested_split;
          return split;
        });
      }

      // tally up how much rent is account for
      var rent_covered = existing_splits.map(function(tenant) {
        return tenant.split;
      }).reduce(function(a, b) {
        return a + b;
      }, 0);

      // how much rent is unaccounted for
      var missing_rent = lease.rent - rent_covered;

      // console.log('already covered: ' + rent_covered, 'rent missing: ' + missing_rent)

      // tally splits up with new user suggested split
      var new_total = existing_splits.map(function(tenant) {
        return tenant.split;
      }).reduce(function(a, b) {
        return a + b;
      }, 0);

      // using the new suggested split, what is left?
      var remaining = lease.rent - new_total;

      // console.log(remaining)

      // check if this exceeds rent
      if (remaining < 0) {
        this.$el.find('.amount').val(missing_rent);
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

      var my_split = split_data[my_id];

      this.$el.find('.amount').val(app.utils.parseMoney(my_split));

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
          amount: tenantModel.toJSON().split
        });

        self.$el.find('.chart').append(self.cards[tenantModel.id].$el);
      });

      var remaining = split_data.data['Remaining'] ? app.utils.prettyMoney(split_data.data['Remaining']) : 0;
      this.$el.find('.remaining').html(remaining);
    },

    updateChart: function(splitInput) {
      var split_data = this.getSplitData(splitInput);

      var id = this.user._id;

      if (!split_data) return;

      var updatedSplit = app.utils.prettyMoney(split_data.data[id]);
      var updatedRemaining = app.utils.prettyMoney(split_data.data['Remaining'] || 0);

      this.$el.find('.remaining').html(updatedRemaining);
      this.cards[id].$el.find('.transfer-data li').html(updatedSplit);
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

    constructData: function() {
      
      var formData = {
        split: this.$el.find('.amount').val(),
        autopay: this.$el.find('#autopay').is(':checked')
      };

      return app.schema.process(formData, this.model);
    }

  });
});