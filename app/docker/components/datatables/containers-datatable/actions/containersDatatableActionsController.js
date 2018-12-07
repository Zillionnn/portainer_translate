angular.module('portainer.docker')
.controller('ContainersDatatableActionsController', ['$rootScope', '$state', 'ContainerService', 'ModalService', 'Notifications', 'HttpRequestHelper',
function ($rootScope, $state, ContainerService, ModalService, Notifications, HttpRequestHelper) {
  var language = $rootScope.language;

  this.startAction = function(selectedItems) {
    var successMessage = 'Container successfully started';
    var errorMessage = 'Unable to start container';
    executeActionOnContainerList(selectedItems, ContainerService.startContainer, successMessage, errorMessage);
  };

  this.stopAction = function(selectedItems) {
    var successMessage = 'Container successfully stopped';
    var errorMessage = 'Unable to stop container';
    executeActionOnContainerList(selectedItems, ContainerService.stopContainer, successMessage, errorMessage);
  };

  this.restartAction = function(selectedItems) {
    var successMessage = 'Container successfully restarted';
    var errorMessage = 'Unable to restart container';
    executeActionOnContainerList(selectedItems, ContainerService.restartContainer, successMessage, errorMessage);
  };

  this.killAction = function(selectedItems) {
    var successMessage = 'Container successfully killed';
    var errorMessage = 'Unable to kill container';
    executeActionOnContainerList(selectedItems, ContainerService.killContainer, successMessage, errorMessage);
  };

  this.pauseAction = function(selectedItems) {
    var successMessage = 'Container successfully paused';
    var errorMessage = 'Unable to pause container';
    executeActionOnContainerList(selectedItems, ContainerService.pauseContainer, successMessage, errorMessage);
  };

  this.resumeAction = function(selectedItems) {
    var successMessage = 'Container successfully resumed';
    var errorMessage = 'Unable to resume container';
    executeActionOnContainerList(selectedItems, ContainerService.resumeContainer, successMessage, errorMessage);
  };

  this.removeAction = function(selectedItems) {
    var isOneContainerRunning = false;
    for (var i = 0; i < selectedItems.length; i++) {
      var container = selectedItems[i];
      if (container.State === 'running') {
        isOneContainerRunning = true;
        break;
      }
    }

    var title = 'You are about to remove one or more container.';
    if (isOneContainerRunning) {
      title = 'You are about to remove one or more running container.';
    }

    ModalService.confirmContainerDeletion(title, function (result) {
        if(!result) { return; }
        var cleanVolumes = false;
        if (result[0]) {
          cleanVolumes = true;
        }
        removeSelectedContainers(selectedItems, cleanVolumes);
      }
    );
  };

  function executeActionOnContainerList(containers, action, successMessage, errorMessage) {
    var actionCount = containers.length;
    angular.forEach(containers, function (container) {
      HttpRequestHelper.setPortainerAgentTargetHeader(container.NodeName);
      action(container.Id)
      .then(function success() {
        Notifications.success(successMessage, container.Names[0]);
      })
      .catch(function error(err) {
        errorMessage = errorMessage + ':' + container.Names[0];
        if(language==='en_US'){
        Notifications.error('Failure', err, errorMessage);

        } else {
          Notifications.error('失败', err, errorMessage);

        }
      })
      .finally(function final() {
        --actionCount;
        if (actionCount === 0) {
          $state.reload();
        }
      });
    });
  }

  function removeSelectedContainers(containers, cleanVolumes) {
    var actionCount = containers.length;
    angular.forEach(containers, function (container) {
      HttpRequestHelper.setPortainerAgentTargetHeader(container.NodeName);
      ContainerService.remove(container, cleanVolumes)
      .then(function success() {
        if(language==='en_US'){
        Notifications.success('Container successfully removed', container.Names[0]);

        } else {
        Notifications.success('容器已成功删除', container.Names[0]);

        }
      })
      .catch(function error(err) {
        if(language==='en_US'){
        Notifications.error('Failure', err, 'Unable to remove container');

        } else {
         Notifications.error('失败', err, '无法移除容器');
   
        }
      })
      .finally(function final() {
        --actionCount;
        if (actionCount === 0) {
          $state.reload();
        }
      });
    });
  }
}]);
