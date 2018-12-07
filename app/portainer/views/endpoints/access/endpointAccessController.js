angular.module('portainer.app')
.controller('EndpointAccessController', ['$rootScope', '$scope', '$transition$', 'EndpointService', 'GroupService', 'Notifications',
function ($rootScope, $scope, $transition$, EndpointService, GroupService, Notifications) {

  $scope.updateAccess = function(authorizedUsers, authorizedTeams) {
    return EndpointService.updateAccess($transition$.params().id, authorizedUsers, authorizedTeams);
  };

  function initView() {
    EndpointService.endpoint($transition$.params().id)
    .then(function success(data) {
      var endpoint = data;
      $scope.endpoint = endpoint;
      return GroupService.group(endpoint.GroupId);
    })
    .then(function success(data) {
      $scope.group = data;
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to retrieve endpoint details');

      } else {
          Notifications.error('失败', err, '无法检索端点详细信息');
  
      }
    });
  }

  initView();
}]);
