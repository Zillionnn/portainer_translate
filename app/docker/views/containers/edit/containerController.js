angular.module('portainer.docker')
.controller('ContainerController', ['$rootScope', '$q', '$scope', '$state','$transition$', '$filter', 'Commit', 'ContainerHelper', 'ContainerService', 'ImageHelper', 'NetworkService', 'Notifications', 'ModalService', 'ResourceControlService', 'RegistryService', 'ImageService', 'HttpRequestHelper',
function ($rootScope, $q, $scope, $state, $transition$, $filter, Commit, ContainerHelper, ContainerService, ImageHelper, NetworkService, Notifications, ModalService, ResourceControlService, RegistryService, ImageService, HttpRequestHelper) {
  $scope.activityTime = 0;
  $scope.portBindings = [];

  $scope.config = {
    Image: '',
    Registry: ''
  };

  $scope.state = {
    recreateContainerInProgress: false,
    joinNetworkInProgress: false,
    leaveNetworkInProgress: false
  };

  $scope.updateRestartPolicy = updateRestartPolicy;

  var update = function () {
    var nodeName = $transition$.params().nodeName;
    HttpRequestHelper.setPortainerAgentTargetHeader(nodeName);
    $scope.nodeName = nodeName;

    ContainerService.container($transition$.params().id)
    .then(function success(data) {
      var container = data;
      $scope.container = container;
      $scope.container.edit = false;
      $scope.container.newContainerName = $filter('trimcontainername')(container.Name);

      if (container.State.Running) {
        $scope.activityTime = moment.duration(moment(container.State.StartedAt).utc().diff(moment().utc())).humanize();
      } else if (container.State.Status === 'created') {
        $scope.activityTime = moment.duration(moment(container.Created).utc().diff(moment().utc())).humanize();
      } else {
        $scope.activityTime = moment.duration(moment().utc().diff(moment(container.State.FinishedAt).utc())).humanize();
      }

      $scope.portBindings = [];
      if (container.NetworkSettings.Ports) {
        angular.forEach(Object.keys(container.NetworkSettings.Ports), function(portMapping) {
          if (container.NetworkSettings.Ports[portMapping]) {
            var mapping = {};
            mapping.container = portMapping;
            mapping.host = container.NetworkSettings.Ports[portMapping][0].HostIp + ':' + container.NetworkSettings.Ports[portMapping][0].HostPort;
            $scope.portBindings.push(mapping);
          }
        });
      }
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to retrieve container info');

      } else {
          Notifications.error('失败', err, '无法检索容器信息');

      }
    });
  };

  function executeContainerAction(id, action, successMessage, errorMessage) {
    action(id)
    .then(function success() {
      Notifications.success(successMessage, id);
      update();
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, errorMessage);

      } else {
          Notifications.error('失败', err, errorMessage);

      }
    });
  }

  $scope.start = function () {
    var successMessage = 'Container successfully started';
    var errorMessage = 'Unable to start container';
    executeContainerAction($transition$.params().id, ContainerService.startContainer, successMessage, errorMessage);
  };

  $scope.stop = function () {
    var successMessage = 'Container successfully stopped';
    var errorMessage = 'Unable to stop container';
    executeContainerAction($transition$.params().id, ContainerService.stopContainer, successMessage, errorMessage);
  };

  $scope.kill = function () {
    var successMessage = 'Container successfully killed';
    var errorMessage = 'Unable to kill container';
    executeContainerAction($transition$.params().id, ContainerService.killContainer, successMessage, errorMessage);
  };

  $scope.pause = function() {
    var successMessage = 'Container successfully paused';
    var errorMessage = 'Unable to pause container';
    executeContainerAction($transition$.params().id, ContainerService.pauseContainer, successMessage, errorMessage);
  };

  $scope.unpause = function() {
    var successMessage = 'Container successfully resumed';
    var errorMessage = 'Unable to resume container';
    executeContainerAction($transition$.params().id, ContainerService.resumeContainer, successMessage, errorMessage);
  };

  $scope.restart = function () {
    var successMessage = 'Container successfully restarted';
    var errorMessage = 'Unable to restart container';
    executeContainerAction($transition$.params().id, ContainerService.restartContainer, successMessage, errorMessage);
  };

  $scope.renameContainer = function () {
    var container = $scope.container;
    ContainerService.renameContainer($transition$.params().id, container.newContainerName)
    .then(function success() {
      container.Name = container.newContainerName;
      if($rootScope.language==='en_US'){
      Notifications.success('Container successfully renamed', container.Name);

      } else {
       Notifications.success('容器已成功重命名', container.Name);

      }
    })
    .catch(function error(err) {
      container.newContainerName = container.Name;
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to rename container');

      } else {
          Notifications.error('失败', err, '无法重命名容器');

      }
    })
    .finally(function final() {
      $scope.container.edit = false;
    });
  };

  $scope.containerLeaveNetwork = function containerLeaveNetwork(container, networkId) {
    $scope.state.leaveNetworkInProgress = true;
    NetworkService.disconnectContainer(networkId, container.Id, false)
    .then(function success() {
      if($rootScope.language==='en_US'){
      Notifications.success('Container left network', container.Id);

      } else {
          Notifications.success('容器离开网络', container.Id);

      }
      $state.reload();
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to disconnect container from network');

      } else {
          Notifications.error('失败', err, '无法从网络断开容器');

      }
    })
    .finally(function final() {
      $scope.state.leaveNetworkInProgress = false;
    });
  };

  $scope.containerJoinNetwork = function containerJoinNetwork(container, networkId) {
    $scope.state.joinNetworkInProgress = true;
    NetworkService.connectContainer(networkId, container.Id)
    .then(function success() {
      if($rootScope.language==='en_US'){
      Notifications.success('Container joined network', container.Id);

      } else {
      Notifications.success('容器加入网络', container.Id);

      }
      $state.reload();
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to connect container to network');

      } else {
          Notifications.error('失败', err, '无法将容器连接到网络');

      }
    })
    .finally(function final() {
      $scope.state.joinNetworkInProgress = false;
    });
  };

  $scope.commit = function () {
    var image = $scope.config.Image;
    var registry = $scope.config.Registry;
    var imageConfig = ImageHelper.createImageConfigForCommit(image, registry.URL);
    Commit.commitContainer({id: $transition$.params().id, tag: imageConfig.tag, repo: imageConfig.repo}, function () {
      update();
      if($rootScope.language==='en_US'){
      Notifications.success('Container commited', $transition$.params().id);

      } else {
       Notifications.success('容器已提交', $transition$.params().id);
   
      }
      $scope.config.Image = '';
    }, function (e) {
      update();
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', e, 'Unable to commit container');

      } else {
          Notifications.error('失败', e, '无法提交容器');

      }
    });
  };


  $scope.confirmRemove = function () {
    var title = 'You are about to remove a container.';
    if ($scope.container.State.Running) {
      title = 'You are about to remove a running container.';
    }
    ModalService.confirmContainerDeletion(
      title,
      function (result) {
        if(!result) { return; }
        var cleanAssociatedVolumes = false;
        if (result[0]) {
          cleanAssociatedVolumes = true;
        }
        removeContainer(cleanAssociatedVolumes);
      }
    );
  };

  function removeContainer(cleanAssociatedVolumes) {
    ContainerService.remove($scope.container, cleanAssociatedVolumes)
    .then(function success() {
      if($rootScope.language==='en_US'){
      Notifications.success('Container successfully removed');

      } else {
          Notifications.success('容器删除成功');

      }
      $state.go('docker.containers', {}, {reload: true});
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to remove container');

      } else {
          Notifications.error('失败', err, '无法移除容器');

      }
    });
  }

  function recreateContainer(pullImage) {
    var container = $scope.container;
    var config = ContainerHelper.configFromContainer(container.Model);
    $scope.state.recreateContainerInProgress = true;
    var isRunning = container.State.Running;

    return pullImageIfNeeded()
      .then(stopContainerIfNeeded)
      .then(renameContainer)
      .then(setMainNetworkAndCreateContainer)
      .then(connectContainerToOtherNetworks)
      .then(startContainerIfNeeded)
      .then(createResourceControlIfNeeded)
      .then(deleteOldContainer)
      .then(notifyAndChangeView)
      .catch(notifyOnError);

    function stopContainerIfNeeded() {
      if (!isRunning) {
        return $q.when();
      }
      return ContainerService.stopContainer(container.Id);
    }

    function renameContainer() {
      return ContainerService.renameContainer(container.Id, container.Name + '-old');
    }

    function pullImageIfNeeded() {
      if (!pullImage) {
        return $q.when();
      }
      return getRegistry().then(function pullImage(containerRegistery) {
        return ImageService.pullImage(container.Config.Image, containerRegistery, true);
      });
    }

    function getRegistry() {
      return RegistryService.retrieveRegistryFromRepository(container.Config.Image);
    }

    function setMainNetworkAndCreateContainer() {
      var networks = config.NetworkingConfig.EndpointsConfig;
      var networksNames = Object.keys(networks);
      if (networksNames.length > 1) {
        config.NetworkingConfig.EndpointsConfig = {};
        config.NetworkingConfig.EndpointsConfig[networksNames[0]] = networks[0];
      }
      return $q.all([ContainerService.createContainer(config), networks]);
    }

    function connectContainerToOtherNetworks(createContainerData) {
      var newContainer = createContainerData[0];
      var networks = createContainerData[1];
      var networksNames = Object.keys(networks);
      var connectionPromises = networksNames.map(function connectToNetwork(name) {
        NetworkService.connectContainer(name, newContainer.Id);
      });
      return $q.all(connectionPromises)
        .then(function onConnectToNetworkSuccess() {
          return newContainer;
        });
    }

    function deleteOldContainer(newContainer) {
      return ContainerService.remove(container, true).then(
        function onRemoveSuccess() {
          return newContainer;
        }
      );
    }

    function startContainerIfNeeded(newContainer) {
      if (!isRunning) {
        return $q.when(newContainer);
      }
      return ContainerService.startContainer(newContainer.Id).then(
        function onStartSuccess() {
          return newContainer;
        }
      );
    }

    function createResourceControlIfNeeded(newContainer) {
      if (!container.ResourceControl) {
        return $q.when();
      }
      var containerIdentifier = newContainer.Id;
      var resourceControl = container.ResourceControl;
      var users = resourceControl.UserAccesses.map(function(u) {
        return u.UserId;
      });
      var teams = resourceControl.TeamAccesses.map(function(t) {
        return t.TeamId;
      });
      return ResourceControlService.createResourceControl(resourceControl.Public, users, teams, containerIdentifier, 'container', []);
    }

    function notifyAndChangeView() {
      if($rootScope.language==='en_US'){
      Notifications.success('Container successfully re-created');

      } else {
          Notifications.success('容器成功重新创建');

      }
      $state.go('docker.containers', {}, { reload: true });
    }

    function notifyOnError(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to re-create container');

      } else {
          Notifications.error('失败', err, '无法重新创建容器');

      }
      $scope.state.recreateContainerInProgress = false;
    }
  }

  $scope.recreate = function() {
    ModalService.confirmContainerRecreation(function (result) {
      if(!result) { return; }
      var pullImage = false;
      if (result[0]) {
        pullImage = true;
      }
      recreateContainer(pullImage);
    });
  };

  function updateRestartPolicy(restartPolicy, maximumRetryCount) {
    maximumRetryCount = restartPolicy === 'on-failure' ? maximumRetryCount : undefined;

    return ContainerService
      .updateRestartPolicy($scope.container.Id, restartPolicy, maximumRetryCount)
      .then(onUpdateSuccess)
      .catch(notifyOnError);

    function onUpdateSuccess() {
      $scope.container.HostConfig.RestartPolicy = {
        Name: restartPolicy,
        MaximumRetryCount: maximumRetryCount
      };
      if($rootScope.language==='en_US'){
      Notifications.success('Restart policy updated');

      } else {
          Notifications.success('重启策略已更新');

      }
    }

    function notifyOnError(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to update restart policy');

      } else {
          Notifications.error('失败', err, '无法更新重启策略');

      }
      return $q.reject(err);
    }
  }

  var provider = $scope.applicationState.endpoint.mode.provider;
  var apiVersion = $scope.applicationState.endpoint.apiVersion;
  NetworkService.networks(
    provider === 'DOCKER_STANDALONE' || provider === 'DOCKER_SWARM_MODE',
    false,
    provider === 'DOCKER_SWARM_MODE' && apiVersion >= 1.25
  )
  .then(function success(data) {
    var networks = data;
    $scope.availableNetworks = networks;
  })
  .catch(function error(err) {
    if($rootScope.language==='en_US'){
    Notifications.error('Failure', err, 'Unable to retrieve networks');

    } else {
      Notifications.error('失败', err, '无法检索网络');

    }
  });

  update();
}]);
