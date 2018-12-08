angular.module('portainer.app')
.controller('HomeController', ['$rootScope',  '$q', '$scope', '$state', 'Authentication', 'EndpointService', 'EndpointHelper', 'GroupService', 'Notifications', 'EndpointProvider', 'StateManager', 'ExtensionManager', 'ModalService', 'MotdService', 'SystemService',
function ($rootScope, $q, $scope, $state, Authentication, EndpointService, EndpointHelper, GroupService, Notifications, EndpointProvider, StateManager, ExtensionManager, ModalService, MotdService, SystemService) {

  $scope.goToEdit = function(id) {
    $state.go('portainer.endpoints.endpoint', { id: id });
  };

  $scope.goToDashboard = function (endpoint) {
    if (endpoint.Type === 3) {
      return switchToAzureEndpoint(endpoint);
    }

    checkEndpointStatus(endpoint)
    .then(function sucess() {
      return switchToDockerEndpoint(endpoint);
    }).catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to verify endpoint status');

      } else {
      Notifications.error('失败', err, '无法验证终端状态');
      
      }
    });
  };

  $scope.dismissImportantInformation = function (hash) {
    StateManager.dismissImportantInformation(hash);
  };

  $scope.dismissInformationPanel = function (id) {
    StateManager.dismissInformationPanel(id);
  };

  $scope.triggerSnapshot = function () {
    ModalService.confirmEndpointSnapshot(function (result) {
      if (!result) {
        return;
      }
      triggerSnapshot();
    });
  };

  function checkEndpointStatus(endpoint) {
    var deferred = $q.defer();

    var status = 1;
    SystemService.ping(endpoint.Id)
    .then(function sucess() {
      status = 1;
    }).catch(function error() {
      status = 2;
    }).finally(function () {
      if (endpoint.Status === status) {
        deferred.resolve(endpoint);
        return deferred.promise;
      }

      EndpointService.updateEndpoint(endpoint.Id, { Status: status })
      .then(function sucess() {
        deferred.resolve(endpoint);
      }).catch(function error(err) {
        deferred.reject({msg: 'Unable to update endpoint status', err: err});
      });
    });

    return deferred.promise;
  }

  function switchToAzureEndpoint(endpoint) {
    EndpointProvider.setEndpointID(endpoint.Id);
    EndpointProvider.setEndpointPublicURL(endpoint.PublicURL);
    EndpointProvider.setOfflineModeFromStatus(endpoint.Status);
    StateManager.updateEndpointState(endpoint.Name, endpoint.Type, [])
    .then(function success() {
      $state.go('azure.dashboard');
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to connect to the Azure endpoint');

      } else {
        Notifications.error('失败', err, '无法连接到Azure终端');
    
      }
    });
  }

  function switchToDockerEndpoint(endpoint) {
    if (endpoint.Status === 2 && endpoint.Snapshots[0] && endpoint.Snapshots[0].Swarm === true) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', '', 'Endpoint is unreachable. Connect to another swarm manager.');

      } else {
         Notifications.error('失败', '', '终端无法访问。 连接到另一个群管理器。');
   
      }
      return;
    } else if (endpoint.Status === 2 && !endpoint.Snapshots[0]) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', '', 'Endpoint is unreachable and there is no snapshot available for offline browsing.');

      } else {
      Notifications.error('失败', '', ' 终端无法访问，并且没有可用于脱机浏览的快照。');
      
      }
      return;
    }

    EndpointProvider.setEndpointID(endpoint.Id);
    EndpointProvider.setEndpointPublicURL(endpoint.PublicURL);
    EndpointProvider.setOfflineModeFromStatus(endpoint.Status);
    ExtensionManager.initEndpointExtensions(endpoint)
    .then(function success(data) {
      var extensions = data;
      return StateManager.updateEndpointState(endpoint, extensions);
    })
    .then(function success() {
      $state.go('docker.dashboard');
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to connect to the Docker endpoint');

      } else {
        Notifications.error('失败', err, '无法连接到Docker终端');
    
      }
    });
  }

  function triggerSnapshot() {
    EndpointService.snapshotEndpoints()
    .then(function success() {
      if($rootScope.language==='en_US'){
      Notifications.success('Success', 'Endpoints updated');

      } else {
       Notifications.success('成功', 'Endpoints updated');
     
      }
      $state.reload();
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'An error occured during endpoint snapshot');

      } else {
      Notifications.error('失败', err, '终端快照期间发生错误');
      
      }
    });
  }

  function initView() {
    $scope.isAdmin = Authentication.getUserDetails().role === 1;

    MotdService.motd()
    .then(function success(data) {
      $scope.motd = data;
    });

    $q.all({
      endpoints: EndpointService.endpoints(),
      groups: GroupService.groups()
    })
    .then(function success(data) {
      var endpoints = data.endpoints;
      var groups = data.groups;
      EndpointHelper.mapGroupNameToEndpoint(endpoints, groups);
      $scope.endpoints = endpoints;
      EndpointProvider.setEndpoints(endpoints);
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to retrieve endpoint information');

      } else {
       Notifications.error('失败', err, '无法检索终端信息');
     
      }
    });
  }

  initView();
}]);
