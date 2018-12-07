angular.module('portainer.app')
.controller('GroupAccessController', ['$rootScope', '$scope', '$transition$', 'GroupService', 'Notifications',
function ($rootScope, $scope, $transition$, GroupService, Notifications) {

  $scope.updateAccess = function(authorizedUsers, authorizedTeams) {
    return GroupService.updateAccess($transition$.params().id, authorizedUsers, authorizedTeams);
  };

  function initView() {
    var groupId = $transition$.params().id;

    GroupService.group(groupId)
    .then(function success(data) {
      $scope.group = data;
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
        Notifications.error('Failure', err, 'Unable to load view');
      } else {
        Notifications.error('Failure', err, '无法加载视图');
      }
      
    });
  }

  initView();
}]);
