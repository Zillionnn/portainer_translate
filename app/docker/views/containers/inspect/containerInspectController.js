angular.module('portainer.docker')
.controller('ContainerInspectController', ['$rootScope', '$scope', '$transition$', 'Notifications', 'ContainerService', 'HttpRequestHelper',
function ($rootScope, $scope, $transition$, Notifications, ContainerService, HttpRequestHelper) {

  $scope.state = {
    DisplayTextView: false
  };
  $scope.containerInfo = {};

  function initView() {
    HttpRequestHelper.setPortainerAgentTargetHeader($transition$.params().nodeName);
    ContainerService.inspect($transition$.params().id)
    .then(function success(d) {
      $scope.containerInfo = d;
    })
    .catch(function error(e) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', e, 'Unable to inspect container');

      } else {
          Notifications.error('失败', e, '无法检查容器');

      }
    });
  }

  initView();
}]);
