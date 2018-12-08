angular.module('portainer.app')
.controller('RegistryAccessController', ['$rootScope', '$scope', '$transition$', 'RegistryService', 'Notifications',
function ($rootScope, $scope, $transition$, RegistryService, Notifications) {

  $scope.updateAccess = function(authorizedUsers, authorizedTeams) {
    return RegistryService.updateAccess($transition$.params().id, authorizedUsers, authorizedTeams);
  };

  function initView() {
    RegistryService.registry($transition$.params().id)
    .then(function success(data) {
      $scope.registry = data;
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to retrieve registry details');

      } else {
           Notifications.error('Failure', err, '无法检索registry详细信息');
 
      }
    });
  }

  initView();
}]);
