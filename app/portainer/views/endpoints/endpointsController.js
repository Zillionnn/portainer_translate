angular.module('portainer.app')
.controller('EndpointsController', ['$rootScope', '$q', '$scope', '$state', 'EndpointService', 'GroupService', 'EndpointHelper', 'Notifications',
function ($rootScope, $q, $scope, $state, EndpointService, GroupService, EndpointHelper, Notifications) {

  $scope.removeAction = function (selectedItems) {
    var actionCount = selectedItems.length;
    angular.forEach(selectedItems, function (endpoint) {
      EndpointService.deleteEndpoint(endpoint.Id)
      .then(function success() {
        if($rootScope.language==='en_US'){
        Notifications.success('Endpoint successfully removed', endpoint.Name);

        } else {
        Notifications.success('终端已成功删除', endpoint.Name);

        }
        var index = $scope.endpoints.indexOf(endpoint);
        $scope.endpoints.splice(index, 1);
      })
      .catch(function error(err) {
        if($rootScope.language==='en_US'){
        Notifications.error('Failure', err, 'Unable to remove endpoint');

        } else {
        Notifications.error('失败', err, '无法删除终端');
     
        }
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
    $q.all({
      endpoints: EndpointService.endpoints(),
      groups: GroupService.groups()
    })
    .then(function success(data) {
      var endpoints = data.endpoints;
      var groups = data.groups;
      EndpointHelper.mapGroupNameToEndpoint(endpoints, groups);
      $scope.groups = groups;
      $scope.endpoints = endpoints;
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to load view');

      } else {
       Notifications.error('失败', err, '无法加载视图');
     
      }
    });
  }

  initView();
}]);
