var ytApp=angular.module('myApp', ['ngMaterial','ngMessages','angular-google-auth2','ngRoute','ui.router','ngResource','ngStorage']);
ytApp.constant('YT_event', {
  STOP:            0, 
  PLAY:            1,
  PAUSE:           2
});

ytApp.run(function($sessionStorage) {
if($sessionStorage.libraryData==undefined){$sessionStorage.libraryData=[]}
googleApiClientReady = function() {
  gapi.auth.init(function() {
    // Other code following the example
  console.log("i am here");

  });
}
});
ytApp.config(function($stateProvider, $urlRouterProvider) {  
    $urlRouterProvider.otherwise('/login');
    $stateProvider
  .state('home', {
    url: '/home',
    templateUrl: 'templates/home.html',
    controller:''
  })
  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller:''
  })
});
ytApp.controller('LoginController', function($scope, S_PersonalData, $location,rmaService,$sessionStorage){
  if(S_PersonalData.s_getPersonalData().isLogin == 'yes'){
    
    $location.path("/home");
  }
  console.log($sessionStorage.libraryData+"   $sessionStorage.libraryData");
  console.log($sessionStorage.libraryData[0]+"   $sessionStorage.libraryData");
        $scope.addVideo=function(videoData){
          if (isUrl(videoData.url)){
            if(videoData.startTime!= undefined && videoData.startTime>0){
              videoData.startTime=videoData.startTime*60*1000;
            }
            else{videoData.startTime=0}
            if(videoData.endTime!= undefined && videoData.endTime>0){
              videoData.endTime=videoData.endTime*60*1000;
            }
            else{videoData.endTime=0}
            $scope.parser = document.createElement('a');
            $scope.parser.href = videoData.url;
            $scope.video_id=($scope.parser.search).slice(3);
            var getVideoDetails = JSON.parse(JSON.stringify({}));
            getVideoDetails.video_id=$scope.video_id;
            rmaService.get(getVideoDetails,function(data){
              var sessionData=JSON.parse(JSON.stringify({}));
              sessionData.name=data.items[0].snippet.title;
              sessionData.startTime=videoData.startTime;
              sessionData.endTime=videoData.endTime;
              sessionData.tags=data.items[0].snippet.tags;
              sessionData.video_id=$scope.video_id;
              sessionData.image=data.items[0].snippet.thumbnails.default.url;
              console.log(sessionData);
              $sessionStorage.libraryData.push(sessionData);
            });
          }
          else{
            if(videoData.startTime!= undefined && videoData.startTime>0){
              videoData.startTime=videoData.startTime*60*1000;
            }
            else{videoData.startTime=0}
            if(videoData.endTime!= undefined && videoData.endTime>0){
              videoData.endTime=videoData.endTime*60*1000;
            }
            else{videoData.endTime=0}
            var getVideoDetails = JSON.parse(JSON.stringify({}));
            getVideoDetails.video_id=videoData.url;
            rmaService.get(getVideoDetails,function(data){
              var sessionData=JSON.parse(JSON.stringify({}));
              sessionData.name=data.items[0].snippet.title;
              sessionData.startTime=videoData.startTime;
              sessionData.endTime=videoData.endTime;
              sessionData.tags=data.items[0].snippet.tags;
              sessionData.image=data.items[0].snippet.thumbnails.medium.url;
              sessionData.video_id=videoData.url;
              $sessionStorage.libraryData.push(sessionData);
            });
          }
          function isUrl(s) {
             var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
             return regexp.test(s);
          }


        }

});

ytApp.controller('libCtrl', function($scope,$sessionStorage,YT_event,$rootScope){
  $scope.libData=$sessionStorage.libraryData;
  $scope.currentVid=function(i){
    $rootScope.val=i;
    return i;
  }

  $scope.currentVid(0);

  this.YT_event = YT_event;

  this.sendControlEvent = function(ctrlEvent) {
    console.log(ctrlEvent);
    $scope.$broadcast(ctrlEvent);
  }

  $scope.$on(YT_event.STATUS_CHANGE, function(event, data) {
      this.yt.playerStatus = data;
  });
});
ytApp.controller('HomeController', function($scope, S_PersonalData, S_GeneralData, $location){
  if(S_PersonalData.s_getPersonalData().isLogin == 'yes'){
        $scope.name = S_PersonalData.s_getPersonalData().name;
        $scope.email = S_PersonalData.s_getPersonalData().email;
        $scope.profileURL = S_PersonalData.s_getPersonalData().profile;
    var your_logout_method = function(){
          // your code if any
          S_GeneralData.s_flush();
          // your code if any
        };
  }else{
    console.log(S_PersonalData.s_getPersonalData().isLogin);
    $location.path("/");
  }
});
ytApp.directive('youtube', function($window, YT_event, youTubeApiService,$sessionStorage,$rootScope) {
  return {
    restrict: "E",

    scope: {
      height: "@",
      width: "@",
      videoid: "@"
    },

    template: '<div></div>',

    link: function(scope, element, attrs, $rootScope, $sessionStorage) {
      var tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      
      var player;

      youTubeApiService.onReady(function() {
        player = setupPlayer(scope, element);
      });

      function setupPlayer(scope, element, $sessionStorage, $rootScope) {
        return new YT.Player(element.children()[0], {
          playerVars: {
            autoplay: 1,
            html5: 1,
            theme: "light",
            modesbranding: 0,
            color: "white",
            iv_load_policy: 3,
            showinfo: 1,
            controls: 1
          },
          
          height: scope.height,
          width: scope.width,
          videoId: scope.videoid, 

          events: {
            'onStateChange': function(event) {
              console.log(event,$sessionStorage.libraryData);
              if(event.data==0){
                if($sessionStorage.libraryData.length<$rootScope.val){
                  $rootScope.val=$rootScope.val+1;
                }
              }
              var message = {
                event: YT_event.STATUS_CHANGE,
                data: ""
              };
              
              switch(event.data) {
                case YT.PlayerState.PLAYING:
                  message.data = "PLAYING";
                  break;
                case YT.PlayerState.ENDED:
                  message.data = "ENDED";
                  break;
                case YT.PlayerState.UNSTARTED:
                  message.data = "NOT PLAYING";
                  break;
                case YT.PlayerState.PAUSED:
                  message.data = "PAUSED";
                  break;
              }

              scope.$apply(function() {
                scope.$emit(message.event, message.data);
              });
            }
          } 
        });        
      }

      scope.$watch('height + width', function(newValue, oldValue) {
        if (newValue == oldValue) {
          return;
        }
    
        player.setSize(scope.width, scope.height);
      
      });

      scope.$watch('videoid', function(newValue, oldValue) {
        if (newValue == oldValue) {
          return;
        }
        
        player.cueVideoById(scope.videoid);
      
      });

      scope.$on(YT_event.STOP, function () {
        player.seekTo(0);
        player.stopVideo();
      });

      scope.$on(YT_event.PLAY, function () {
        console.log("RECEIVING");
        player.playVideo();
      }); 

      scope.$on(YT_event.PAUSE, function () {
        player.pauseVideo();
      });  

    }  
  };
});

ytApp.factory('rmaService', ['$resource',
    function ($resource) {
        return $resource(
               'https://content.googleapis.com/youtube/v3/videos?id=:video_id&part=snippet&key=AIzaSyB6FLeuu0tFuplQUrviLSy4q8ePclWCmmc',
                { 
                    video_id: '@video_id'
                });
    }]);
ytApp.factory("youTubeApiService", function($q, $window) {
  
  var deferred = $q.defer();
  var apiReady = deferred.promise;

  $window.onYouTubeIframeAPIReady = function() {
    deferred.resolve();
  }

  return {
    onReady: function(callback) {
      apiReady.then(callback);
    }
  }   

});
