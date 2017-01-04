/**
 * AppCollection.js
 */

define([
  'app'
],
function(app) {

  var AppCollection = Backbone.Collection.extend({

    idAttribute: '_id',

    sort_key: '_id',

    initialize: function(models, options) {
      if (!options) options = {};
      if (!this.options) this.options = {};

      this.options = _.extend(this.options, options); 

      return this;
    },

    comparator: function(item) {
      return item.get(this.sort_key);
    },
    
    sortByField: function(fieldName, reverse) {
      this.sort_key = fieldName;
      this.sort();
    },

    search: function(query) {

      var cache;

      if (query.constructor === Array) {
        cache = {};
        query.forEach(function(tag, i) {
          cache[tag.toLowerCase()] = 0;
        });
      } else if (query.constructor === String) {
        query = query.toLowerCase();
      }

      var filtered = this.filter(function(model) {
        var check = false;
        var attrs = _.omit(model.attributes, model.search_filters);
        
        var cache_clone;
        if (cache) cache_clone = _.extend({}, cache);

        for (var attr in attrs) {
          if (typeof attrs[attr] == 'string') {
            if (cache_clone) {
              // all tags in query must match at least once
              for (var tag in cache_clone) {
                if (('' + attrs[attr]).toLowerCase().indexOf(tag) > -1) {
                  cache_clone[tag]++;
                }
              }
            } else if (typeof query == 'string') {
              if (('' + attrs[attr]).toLowerCase().indexOf(query) > -1) {
                check = true;
              }
            }
          }
        }

        if (cache_clone) {
          // NOTE: this could be used to rank best matches
          return _.every(_.values(cache_clone), function(v) {
            return v > 0;
          });
        } else {
          return check;
        }
      });
      return new AppCollection(filtered);
    },

    filters: function(filters) {
      var filtered = this.filter(function(model) {

        // remove attributes that should not be searchable
        var attrs = _.omit(model.attributes, model.search_filters);

        // empty objects for dependent matching
        var cache = {}, check = {};

        // build cache object to test each attribute
        for (var field in filters) {
          if (filters[field].length === 0) continue;
          cache[field] = {};
          check[field] = false;

          // date range
          if (filters[field].dates) {
            // cache[field].dates = filters[field].dates;
            cache[field].dates = model.get(field);

          // normal filters
          } else {
            // set each attr cache to 0, increment for each fuzzy match
            filters[field].forEach(function(tag) {
              cache[field][tag] = 0;
              var attr = model.get(field);

              // if there is a match, increment the cache value
              // ex. cache.first_name.nick === 1
              
              if (filters[field].indexOf(attr.toString()) > -1) cache[field][tag]++;
            });
          }
        }

        for (var field2 in cache) {

          // if type is date_range
          if (typeof cache[field2] === 'object' && cache[field2].dates) {

            var min = moment(filters[field2].dates[0]);
            var max = moment(filters[field2].dates[1]);

            // check if each field is true for models
            check[field2] = _.every(cache[field2], function(v) {
              var model_date = moment.utc(v);
              return min <= model_date && model_date <= max;
            });

          // or is normal filter
          } else {
            check[field2] = _.some(_.values(cache[field2]), function(v) {
              return v > 0;
            });
          }
        }

        return _.every(_.values(check), function(v) {
          return v === true;
        });
      });

      return new AppCollection(filtered);
    }
  });

  return AppCollection;

});