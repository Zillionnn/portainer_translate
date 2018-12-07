angular.module('portainer.docker')
.controller('EventsController', ['$rootScope', '$scope', 'Notifications', 'SystemService',
function ($rootScope, $scope, Notifications, SystemService) {

  function initView() {
    var from = moment().subtract(24, 'hour').unix();
    var to = moment().unix();

    SystemService.events(from, to)
    .then(function success(data) {
      $scope.events = data;
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to load events');

      } else {
         Notifications.error('失败', err, '无法加载事件');
 
      }
    });
  }

  initView();
}]);
