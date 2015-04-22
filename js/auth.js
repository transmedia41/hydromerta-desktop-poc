angular.module('citizen-engagement.auth', ['angular-storage'])

  .factory('AuthService', function(store) {

    var service = {
      currentUserId: store.get('currentUserId'),

      setUser: function(user) {
        console.log(user);
        service.currentUserId = user.userId;
        service.login = user.lastname;
        service.firstname = user.firstname;
        store.set('currentUserId', user.userId);
        store.set("lastname", user.lastname);
        store.set("firstname",user.firstname);
      },

      unsetUser: function() {
        service.currentUserId = null;
        store.remove('currentUserId');
      }
    };

    return service;

  })
.factory('AuthInterceptor', function(AuthService) {
    return {

      // The request function will be called before all requests.
      // In it, you can modify the request configuration object.
      request: function(config) {

        // If the user is logged in, add the X-User-Id header.
        if (AuthService.currentUserId) {
          config.headers['X-User-Id'] = AuthService.currentUserId;
        }

        return config;
      }
    };
  });