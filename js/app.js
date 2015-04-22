// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'

angular.module('citizen-engagement', ['geolocation', 'ionic', 'citizen-engagement.auth', 'citizen-engagement.constants', 'leaflet-directive', 'angular-storage'])

///////////////////////////////////////////////////////////
//////////             CONFIG                //////////////
///////////////////////////////////////////////////////////

.filter('capitalize', function() {
    return function(input, all) {
      return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}) : '';
    }
  })

        .run(function ($ionicPlatform) {
            $ionicPlatform.ready(function () {
                // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
                // for form inputs)
                if (window.cordova && window.cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                }
                if (window.StatusBar) {
                    StatusBar.styleDefault();
                }
            });
        })
        .config(function ($stateProvider, $urlRouterProvider) {

            // Ionic uses AngularUI Router which uses the concept of states
            // Learn more here: https://github.com/angular-ui/ui-router
            // Set up the various states which the app can be in.
            // Each state's controller can be found in controllers.js
            $stateProvider

                    // This is the abstract state for the tabs directive.
                    .state('tab', {
                        url: '/tab',
                        abstract: true,
                        templateUrl: 'templates/tabs.html'
                    })

                    // The three next states are for each of the three tabs.
                    // The state names start with "tab.", indicating that they are children of the "tab" state.
                    .state('tab.newIssue', {
                        // The URL (here "/newIssue") is used only internally with Ionic; you never see it displayed anywhere.
                        // In an Angular website, it would be the URL you need to go to with your browser to enter this state.
                        url: '/newIssue',
                        views: {
                            // The "tab-newIssue" view corresponds to the <ion-nav-view name="tab-newIssue"> directive used in the tabs.html template.
                            'tab-newIssue': {
                                // This defines the template that will be inserted into the directive.
                                templateUrl: 'templates/reportIssue.html'
                            }
                        }
                    })
                    .state('tab.reportIssue', {
                        url: '/reportIssue',
                        views: {
                            'tab-reportIssue': {
                                templateUrl: 'templates/reportIssue.html'

                            }
                        }
                    })
                   .state('tab.issueMap', {
                        url: '/issueMap?lat?lng',
                        views: {
                            'tab-issueMap': {
                                templateUrl: 'templates/issueMap.html',
                                controller: 'MapController'
                            }
                        }
                    })

                    .state('tab.issueList', {
                        url: '/issueList',
                        views: {
                            'tab-issueList': {
                                templateUrl: 'templates/issueList.html'

                            }
                        }
                    })
                    .state('tab.myAccountList', {
      url: '/myAccount',
      views: {
        'tab-issueList': {
          templateUrl: 'templates/myAccount.html'
        }
      }
    })
    .state('tab.myAccountMap', {
      url: '/myAccount',
      views: {
        'tab-issueMap': {
          templateUrl: 'templates/myAccount.html'
        }
      }
    })
    .state('tab.myAccountReport', {
      url: '/myAccount',
      views: {
        'tab-newIssue': {
          templateUrl: 'templates/myAccount.html'
        }
      }
    })
    .state('tab.myAccountDetailsMap', {
      url: '/myAccount',
      views: {
        'tab-issueMap': {
          templateUrl: 'templates/myAccount.html'
        }
      }
    })
    .state('tab.myAccountDetailsList', {
      url: '/myAccount',
      views: {
        'tab-issueList': {
          templateUrl: 'templates/myAccount.html'
        }
      }
    })
                    .state('login', {
                        url: '/login',
                        controller: 'LoginCtrl',
                        templateUrl: 'templates/login.html'
                    })
//                  
                    //This is the issue details state.
                    .state('tab.issueDetails', {
                        // We use a parameterized route for this state.
                        // That way we'll know which issue to display the details of.
                        url: '/issueDetails/:issueId',
                        views: {
                            // Here we use the same "tab-issueList" view as the previous state.
                            // This means that the issue details template will be displayed in the same tab as the issue list.
                            'tab-issueList': {
                                templateUrl: 'templates/issueDetails.html'
                            }
                        }
                    })
                    .state('tab.issueDetailsMap', {
      // We use a parameterized route for this state.
      // That way we'll know which issue to display the details of.
      url: '/issueDetails/:issueId',
      views: {
        // Here we use the same "tab-issueList" view as the previous state.
        // This means that the issue details template will be displayed in the same tab as the issue list.
        'tab-issueMap': {
          templateUrl: 'templates/issueDetails.html'
        }
      }
    })
    ;

            // Define the default state (i.e. the first screen displayed when the app opens).
            $urlRouterProvider.otherwise(function ($injector) {
                $injector.get('$state').go('tab.newIssue'); // Go to the new issue tab by default.
            });
        })
        .run(function (AuthService, $rootScope, $state) {

            // Listen for the $stateChangeStart event of AngularUI Router.
            // This event indicates that we are transitioning to a new state.
            // We have the possibility to cancel the transition in the callback function.
            $rootScope.$on('$stateChangeStart', function (event, toState) {

                // If the user is not logged in and is trying to access another state than "login"...
                if (!AuthService.currentUserId && toState.name != 'login') {

                    // ... then cancel the transition and go to the "login" state instead.
                    event.preventDefault();
                    $state.go('login');
                }
            });
        })
        .config(function ($httpProvider) {
            $httpProvider.interceptors.push('AuthInterceptor');
        })


///////////////////////////////////////////////////////////
//////////               CONTROLLERS         //////////////
///////////////////////////////////////////////////////////

        .controller('LoginCtrl', function (AuthService, $http, $ionicHistory, $ionicLoading, $scope, $state, apiUrl) {

            // The $ionicView.beforeEnter event happens every time the screen is displayed.
            $scope.$on('$ionicView.beforeEnter', function () {
                // Re-initialize the user object every time the screen is displayed.
                // The first name and last name will be automatically filled from the form thanks to AngularJS's two-way binding.
                $scope.user = {};
            });

            // Add the register function to the scope.
            $scope.register = function () {

                // Forget the previous error (if any).
                delete $scope.error;

                // Show a loading message if the request takes too long.
                $ionicLoading.show({
                    template: 'Logging in...',
                    delay: 750
                });

                // Make the request to retrieve or create the user.
                $http({
                    method: 'POST',
                    url: apiUrl + '/users/logister',
                    data: $scope.user
                }).success(function (user) {
                    
                    user.lastname = $scope.user.lastname;
                    user.firstname =$scope.user.firstname;
                    // If successful, give the user to the authentication service.
                    AuthService.setUser(user);

                    // Hide the loading message.
                    $ionicLoading.hide();

                    // Set the next view as the root of the history.
                    // Otherwise, the next screen will have a "back" arrow pointing back to the login screen.
                    $ionicHistory.nextViewOptions({
                        disableBack: true,
                        historyRoot: true
                    });

                    // Go to the issue creation tab.
                    $state.go('tab.newIssue');

                }).error(function () {

                    // If an error occurs, hide the loading message and show an error message.
                    $ionicLoading.hide();
                    $scope.error = 'Could not log in.';
                });
            };
        })
        .controller('LogoutCtrl', function (AuthService, $scope, $state) {
            $scope.logOut = function () {
                AuthService.unsetUser();
                $state.go('login');
            };
        })
        .controller("myAccountCtrl",function(IssuesService, $scope, $state,$ionicSideMenuDelegate){
    $scope.id = localStorage.currentUserId.substring(1,localStorage.currentUserId.length-1);
    $scope.lastname = localStorage.lastname.substring(1, localStorage.lastname.length-1);
    $scope.firstname  =localStorage.firstname.substring(1, localStorage.firstname.length-1);

    $scope.goToMyAccountList = function(){
       $state.go('tab.myAccountList');
    },
     $scope.goToMyAccountMap = function(){
       $state.go('tab.myAccountMap');
    },
     $scope.goToMyAccountReport = function(){
      console.log('asd')
       $state.go('tab.myAccountReport');
    },
     $scope.goToMyAccountDetailsList = function(){
       $state.go('tab.myAccountDetailsList');
    },
     $scope.goToMyAccountAccountDetailsMap = function(){
       $state.go('tab.myAccountDetailsMap');
    },
    $scope.toggleLeft = function() {
      $ionicSideMenuDelegate.toggleLeft();
  };
  IssuesService.getIssues(function(error, data){
    $scope.issues = [];
    for (var i = data.length - 1; i >= 0; i--) {
       var issue =  myIssues(data[i],$scope.id);
       var lat = data[i].lat
       var lng = data[i].lng
       //myIssues(issue,$scope.id, $scope);
       if (issue) {
         addCity(issue)
        $scope.issues.push(issue);
       };
    };

  });
  function myIssues(issue,id){
      if (issue.owner.id == id) {
        return issue;
      }
      return null;
  }
   function addCity(issue) {
       var lat = issue.lat;
        var lng = issue.lng 
       IssuesService.getCity(lat, lng,  function(address){
           issue.city = address.results[1].formatted_address;
        });
   }
})

     .controller("MapController", function ($state,$scope, mapboxMapId, mapboxAccessToken, IssuesService, geolocation,$stateParams) {
    var markers = [];
    var mapboxTileLayer = "http://api.tiles.mapbox.com/v4/" + mapboxMapId;
    angular.extend($scope, {
      mapDefaults: {
          tileLayer: mapboxTileLayer + "/{z}/{x}/{y}.png?access_token=" + mapboxAccessToken,
          maxZoom: 20,    
        },
        mapMarkers:{
        },
          layers: {
            baselayers: {
                openStreetMap: {
                    name: 'main',
                    type: 'xyz',
                    url: mapboxTileLayer + "/{z}/{x}/{y}.png?access_token=" + mapboxAccessToken
                }
            },
            overlays: {
                main: {
                    type: 'group',
                    name: 'All',
                    visible: true
                },
                selected:{
                   type: 'group',
                    name: 'Selected',
                    visible: true
                }
            }
        
        },
       mapCenter: {
            lat: 46.78,
            lng: 6.65,
            zoom: 13
          }
    });
    
    $scope.$on('$ionicView.beforeEnter', function () {
      if($stateParams.lat && $stateParams.lng){
       
       var angIcon = {
            iconUrl: 'img/marker.png',
            iconSize:     [38, 45],
            shadowSize:   [50, 64],
            iconAnchor:   [22, 44],
            shadowAnchor: [4, 62],
            popupAwnchor:  [-3, -76]
       }

       var newMarker = {
          icon: angIcon,
          layer: 'selected',
          lat:  $stateParams.lat,
          lng:  $stateParams.lng,
          message: "here!"   
       }
       markers.push(newMarker);
       $scope.mapMarkers = markers;
       console.log($scope);

      }//if

    })


    function createMarkerScope(issue) {
        return function () {//on crée le scop manuellement pour que ce scope soit sous le markeur et on lui ajoute l issue
            var scope = $scope.$new();
            scope.issue = issue;
            return scope;
        };
    }
 
   
    IssuesService.getIssues(function (error, data) {
        $scope.issues = data;

    //tester si l'issue est ok, est présente !=undefined
        for (var i = 0, max = data.length; i < max; i++) {
            var issue = $scope.issues[i];

            if (!isNaN(issue.lng) && !isNaN(issue.lng)) {
              var marker = {
                  layer: 'main',
                  lat: issue.lat,
                  lng: issue.lng,
                  message: '<p>{{issue.description}}</p><img src=' + issue.imageUrl + ' width="200px"/>\n\
                  <a ng-controller="IssueDetailsController" ng-click="goToIssueDetailsMap(issue.id)" class="button icon-right ion-chevron-right button-clear button-dark"></a>',
                  getMessageScope: createMarkerScope(issue)  
             }
            };
          markers.push(marker);
      }
      $scope.mapMarkers = markers
  
    });

    geolocation.getLocation().then(function (data) {
     //    $scope.mapCenter.lat = data.coords.latitude;
     ///   $scope.mapCenter.lng = data.coords.longitude;
    }, function (error) {
        console.log("Could not get location: " + error);
      } 
    );

})
        .controller("IssuesController",function(DateService,$scope, IssuesService, $http, apiUrl, $ionicLoading){
    $scope.myIssuesFilterToggle = function(){
    $ionicLoading.show({
        template: 'Loading...',
      });
    if($scope.myToggle){ 
      $scope.issues = [];
      IssuesService.getIssues(function(error, data){
          $scope.issues = [];
          for (var i = data.length - 1; i >= 0; i--) {
             var issue =  myIssues(data[i],id);
             var lat = data[i].lat
             var lng = data[i].lng
             //myIssues(issue,$scope.id, $scope);
             if (issue) {
               addCity(issue)
               DateService.formatDateIssue(issue)
              $scope.issues.push(issue);
             };
          };
        });
      $ionicLoading.hide()
      
    }else{
      IssuesService.getIssues(function(error, data){
      $scope.issues = data;
      for (var i = data.length - 1; i >= 0; i--) {
    
        var issue = $scope.issues[i];
       // var date = new Date($scope.issues[i].createdOn);
        addCity(issue);
        DateService.formatDateIssue(issue)
        $ionicLoading.hide()
         
      };//for
    })//issue service
    }
  };
  
   IssuesService.getIssues(function(error, data){
    $ionicLoading.show({
      template:'Loading...'
    })
      $scope.issues = data;
      for (var i = data.length - 1; i >= 0; i--) {
    
        var issue = $scope.issues[i];
       // var date = new Date($scope.issues[i].createdOn);
        addCity(issue);
        DateService.formatDateIssue(issue);
         
      };//for
      $ionicLoading.hide();
    })//issue service

   function addCity(issue) {
       var lat = issue.lat;
        var lng = issue.lng 
       IssuesService.getCity(lat, lng,  function(address){
           issue.city = address.results[1].formatted_address;
        });
   }
   $scope.orderBy = function(text){
      $scope.order =  text
   }
})
        .controller("IssueDetailsController",function($scope, $state, $stateParams, $attrs, IssuesService){
   $scope.goToIssueDetails = function(issueId){
         $state.go("tab.issueDetails", {issueId:issueId});
    }
    $scope.goToIssueDetailsMap = function(issueId){
         $state.go("tab.issueDetailsMap", {issueId:issueId});
    }
})
        
.controller('SeeIssueOnMapController',function(){

})
        
        .controller("GetOneIssueController", function(DateService, AuthService, apiUrl,$http, $scope, IssuesService,$stateParams, $state){
    $scope.issueId = $stateParams.issueId;
    console.log($scope.issueId)
    IssuesService.getIssueDetails($scope.issueId,function(data){
          $scope.issue = data;        
          addAddress($scope.issue)
          DateService.formatDateIssue($scope.issue)

    });
      $scope.showOnMap = function(lat, lng){
        $state.go('tab.issueMap',{lat:lat, lng:lng})

    }
    function addAddress(issue) {
       var lat = issue.lat;
       var lng = issue.lng 
       IssuesService.getCity(lat, lng,  function(address){
        console.log(address.results)
           issue.city = address.results[0].formatted_address;
        });
   }
   $scope.seeOnMap = function(){
      $state.go("tab.issueMap");
   }
   $scope.postComment = function(comment,issue){
    var theComment = {
      "text": comment,
      "author":{
        "name":localStorage.firstname.substring(1,localStorage.firstname.length-1) +" "+localStorage.lastname.substring(1,localStorage.lastname.length-1) 
      },
      "postedOn": DateService.formatDate(new Date())
    }
    issue.comments.push(theComment);
    
      $http({
            method: 'POST',
            url: apiUrl + '/issues/'+issue.id+"/actions",
            headers: {
              'Content-Type': 'application/json',
            },
            data: {
              "type":"comment",
              "payload": {
                "text": comment              
              }
            }
          }).success(function(data, status){       
             console.log('sucess!');

          }).error(function(err){
            console.log('nope');
          }) 
   };
})

        .controller("CreateIssueController", function ($state, CameraService, $scope, IssuesService, IssueTypesService, geolocation, store, $http, qimgUrl, qimgToken) {
            
            $scope.newIssue = {};
           
            geolocation.getLocation().then(function (data) {
                $scope.newIssue.lat = data.coords.latitude;
                $scope.newIssue.lng = data.coords.longitude;
                
            }, function (error) {
                console.log("Could not get location: " + error);
                $log.error("Could not get location: " + error);
            } );
    
            IssueTypesService.getIssueTypes(callbackServiceIssueTypes);
            
            function callbackServiceIssueTypes(error, data){
               if(error){
                  
                   alert(error.statusText);
               }else{
                 
                   $scope.issueTypes = data;
               }
                   
            }
            
            function takePhoto() {

                return CameraService.getPicture({
                    quality: 75,
                    targetWidth: 400,
                    targetHeight: 300,
// return base64-encoded data instead of a file
                    destinationType: Camera.DestinationType.DATA_URL

                });
            }
            function uploadPhoto(imageData) {
                
                var promise = $http({
                    method: 'POST',
                    url: qimgUrl+"/images",
                    headers: {
                        'Authorization': "Bearer " + qimgToken
                    }, data: {
                        data: imageData
                    }
                });

                return promise;
            }
            
            $scope.ClickPhoto = function ClickPhoto(){
               
            takePhoto().then(uploadPhoto).then(function (data) {
                   
                  $scope.newIssue.imageUrl = data.data.url;
                    
                }, function(error) {
           alert(error);
                });

};
                
$scope.TestClickFunction = function TestClickFunction(){
   
                console.log("Test Click Function");
                console.log(".. and also ...");
                console.log("Test Get Form Value");
                 $scope.newIssue.description = $scope.newIssueModel.description;
                 $scope.newIssue.issueTypeId = $scope.newIssueModel.issueType.substring(1,$scope.newIssueModel.issueType.length-1);
                  
                 //alert(JSON.stringify($scope.newIssue));
                
                IssuesService.createIssue($scope.newIssue, function(data){
                    $state.go("tab.issueDetails", {issueId:data.id});
                              
            });
          
        };
        
        })
        
        
//        $scope.testLocalstorage = function(){
//            console.log("--------------TEST LOCAL STORAGE -------------");
//                store.set("test","yep je suis dans la variable");
//                var testlocalStorage = localStorage.test.substring(1, localStorage.test.length-1);
//                console.log("Ma variable AVANT le remove: "+testlocalStorage);
//                store.remove("test");
//                //ça marche!!
//        }
        
///////////////////////////////////////////////////////////
//////////               SERVICES            //////////////
///////////////////////////////////////////////////////////   
        .factory("DateService",function(){
  return{
    formatDate : function(date){
      var newDate =  date.toLocaleDateString("fr-CH")+" at "+date.getHours() + ":" + date.getMinutes()
      return newDate;

  },
    formatDateIssue: function(issue){
        var date = new Date(issue.createdOn)
        var newDate =  date.toLocaleDateString("fr-CH")+" at "+date.getHours() + ":" + date.getMinutes()
        issue.createdOn = newDate;
        for (var i = issue.comments.length - 1; i >= 0; i--) {
            var date = new Date(issue.comments[i].postedOn);
            issue.comments[i].postedOn = this.formatDate(date);
        };
    }
}})

        .factory("IssuesService", function(apiUrl, $http, mapsUrl, $state){
  return{ 
    getIssues: function(callback){
       $http({
            method: 'GET',
            url: apiUrl + '/issues',
            headers: {
              'Content-Type': 'application/json',
              'x-pagination': '0;100'
            }
          }).success(function(data, status){       
             callback(null, data)
          }).error(function(err){
            callback(err)
          })   
    },
    getCity: function(lat, lng, callback){
        $http({method: 'GET',
          url: mapsUrl+"/geocode/json?latlng="+lat+","+lng+"&sensor=false",
          dataType: "jsonp"})
          .success(function(response) {
            callback(response);
          });
    },
    getIssueDetails: function (issueid,callback) {
        $http({
            method: 'GET',
            url: apiUrl + '/issues/'+issueid
        }).success(function (data) {
            callback(data);
        }).error(function (err) {
            callback(err);
        });
        },
    createIssue: function (newIssue, callback) {
         $http({
            method: 'POST',
            url: apiUrl + '/issues/',
            data: newIssue
        }).success(function (data) {
            callback(data);
        }).error(function (err) {
            callback(err);
        });
    }
  }//return
})

        .factory("IssueTypesService", function (apiUrl, $http) {
            return{
                getIssueTypes: function (callback) {
                    $http({
                        method: 'GET',
                        url: apiUrl + '/issueTypes',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-pagination': '0;100'
                                    //'x-sort': 'name'
                        }
                    }).success(function (data, status) {
                        callback(null, data);
                    }).error(function (err) {
                        callback(err);
                    });
                }
            }
        })

        .factory('CameraService', ['$q', function ($q) {

                return {
                    getPicture: function (options) {
                        var q = $q.defer();
                      
                        navigator.camera.getPicture(function (result) {
                            // Do any magic you need
                            
                            q.resolve(result);
                        }, function (err) {
                            q.reject(err);
                        }, options);

                        return q.promise;
                    }
                }
            }])

        ;

