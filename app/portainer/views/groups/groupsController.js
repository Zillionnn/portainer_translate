angular.module('portainer.app')
.controller('GroupsController', ['$rootScope','$scope', '$state', '$filter',  'GroupService', 'Notifications',
function ($rootScope, $scope, $state, $filter, GroupService, Notifications) {

  $scope.removeAction = function (selectedItems) {
    var actionCount = selectedItems.length;
    angular.forEach(selectedItems, function (group) {
      GroupService.deleteGroup(group.Id)
      .then(function success() {
        Notifications.success('Endpoint group successfully removed', group.Name);
        var index = $scope.groups.indexOf(group);
        $scope.groups.splice(index, 1);
      })
      .catch(function error(err) {
        Notifications.error('Failure', err, 'Unable to remove group');
      })
      .finally(function final() {
        --actionCount;
        if (actionCount === 0) {
          $state.reload();
        }
      });
    });
  };

  function initView() {
    GroupService.groups()
    .then(function success(data) {
      $scope.groups = data;
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
        Notifications.error('Failure', err, 'Unable to retrieve endpoint groups');
      } else {
        Notifications.error('失败', err, '无法检索终端组');
      }
      
      $scope.groups = [];
    });
  }

  initView();
}]);
