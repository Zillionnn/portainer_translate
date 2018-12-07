angular.module('portainer.docker')
.controller('NetworkController', ['$rootScope', '$scope', '$state', '$transition$', '$filter', 'NetworkService', 'Container', 'Notifications', 'HttpRequestHelper',
function ($rootScope, $scope, $state, $transition$, $filter, NetworkService, Container, Notifications, HttpRequestHelper) {

  $scope.removeNetwork = function removeNetwork() {
    NetworkService.remove($transition$.params().id, $transition$.params().id)
    .then(function success() {
      if($rootScope.language==='en_US'){
      Notifications.success('Network removed', $transition$.params().id);

      } else {
          Notifications.success('网络已删除', $transition$.params().id);

      }
      $state.go('docker.networks', {});
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to remove network');

      } else {
         Notifications.error('失败', err, '无法删除网络');
 
      }
    });
  };

  $scope.containerLeaveNetwork = function containerLeaveNetwork(network, container) {
    HttpRequestHelper.setPortainerAgentTargetHeader(container.NodeName);
    NetworkService.disconnectContainer($transition$.params().id, container.Id, false)
    .then(function success() {
      if($rootScope.language==='en_US'){
      Notifications.success('Container left network', $transition$.params().id);

      } else {
          Notifications.success('容器离开网络', $transition$.params().id);

      }
      $state.go('docker.networks.network', { id: network.Id }, { reload: true });
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to disconnect container from network');

      } else {
          Notifications.error('失败', err, '无法从网络断开容器');

      }
    });
  };

  function filterContainersInNetwork(network, containers) {
    var containersInNetwork = [];
    containers.forEach(function(container) {
      var containerInNetwork = network.Containers[container.Id];
      if (containerInNetwork) {
        containerInNetwork.Id = container.Id;
        // Name is not available in Docker 1.9
        if (!containerInNetwork.Name) {
          containerInNetwork.Name = $filter('trimcontainername')(container.Names[0]);
        }
        containersInNetwork.push(containerInNetwork);
      }
    });
    $scope.containersInNetwork = containersInNetwork;
  }

  function getContainersInNetwork(network) {
    var apiVersion = $scope.applicationState.endpoint.apiVersion;
    if (network.Containers) {
      if (apiVersion < 1.24) {
        Container.query({}, function success(data) {
          var containersInNetwork = data.filter(function filter(container) {
            if (container.HostConfig.NetworkMode === network.Name) {
              return container;
            }
          });
          filterContainersInNetwork(network, containersInNetwork);
        }, function error(err) {
          
          if($rootScope.language==='en_US'){
        Notifications.error('Failure', err, 'Unable to retrieve containers in network');
          } else {
        Notifications.error('失败', err, '无法检索网络中的容器');
          }
        });
      } else {
        Container.query({
          filters: { network: [$transition$.params().id] }
        }, function success(data) {
          filterContainersInNetwork(network, data);
        }, function error(err) {
          if($rootScope.language==='en_US'){
          Notifications.error('Failure', err, 'Unable to retrieve containers in network');

          } else {
         Notifications.error('失败', err, '无法检索网络中的容器');
 
          }
        });
      }
    }
  }

  function initView() {
    var nodeName = $transition$.params().nodeName;
    HttpRequestHelper.setPortainerAgentTargetHeader(nodeName);
    $scope.nodeName = nodeName;
    NetworkService.network($transition$.params().id)
    .then(function success(data) {
      $scope.network = data;
      var endpointProvider = $scope.applicationState.endpoint.mode.provider;
      if (endpointProvider !== 'VMWARE_VIC') {
        getContainersInNetwork(data);
      }
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to retrieve network info');

      } else {
         Notifications.error('失败', err, '无法检索网络信息');
 
      }
    });
  }

  initView();
}]);
