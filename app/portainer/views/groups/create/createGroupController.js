angular.module('portainer.app')
.controller('CreateGroupController', ['$rootScope', '$q', '$scope', '$state', 'GroupService', 'EndpointService', 'TagService', 'Notifications',
function ($rootScope, $q, $scope, $state, GroupService, EndpointService, TagService, Notifications) {

  $scope.state = {
    actionInProgress: false
  };

  $scope.create = function() {
    var model = $scope.model;

    var associatedEndpoints = [];
    for (var i = 0; i < $scope.associatedEndpoints.length; i++) {
      var endpoint = $scope.associatedEndpoints[i];
      associatedEndpoints.push(endpoint.Id);
    }

    $scope.state.actionInProgress = true;
    GroupService.createGroup(model, associatedEndpoints)
    .then(function success() {
      if($rootScope.language==='en_US'){
      Notifications.success('Group successfully created');

      } else {
        Notifications.success('组成功创建');
    
      }
      $state.go('portainer.groups', {}, {reload: true});
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to create group');

      } else {
        Notifications.error('失败', err, '无法创建组');
    
      }
    })
    .finally(function final() {
      $scope.state.actionInProgress = false;
    });
  };

  function initView() {
    $scope.model = new EndpointGroupDefaultModel();

    $q.all({
      endpoints: EndpointService.endpointsByGroup(1),
      tags: TagService.tagNames()
    })
    .then(function success(data) {
      $scope.availableEndpoints = data.endpoints;
      $scope.associatedEndpoints = [];
      $scope.availableTags = data.tags;
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to retrieve endpoints');

      } else {
       Notifications.error('失败', err, '无法检索终端');
     
      }
    });
  }

  initView();
}]);
