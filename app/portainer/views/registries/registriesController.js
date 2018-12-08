angular.module('portainer.app')
.controller('RegistriesController', ['$rootScope', '$q', '$scope', '$state', 'RegistryService', 'DockerHubService', 'ModalService', 'Notifications',
function ($rootScope,$q, $scope, $state, RegistryService, DockerHubService, ModalService, Notifications) {

  $scope.state = {
    actionInProgress: false
  };

  $scope.formValues = {
    dockerHubPassword: ''
  };

  $scope.updateDockerHub = function() {
    var dockerhub = $scope.dockerhub;
    dockerhub.Password = $scope.formValues.dockerHubPassword;
    $scope.state.actionInProgress = true;
    DockerHubService.update(dockerhub)
    .then(function success() {
      if($rootScope.language==='en_US'){
      Notifications.success('DockerHub registry updated');

      } else {
       Notifications.success('DockerHub registry已更新');
     
      }
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to update DockerHub details');

      } else {
      Notifications.error('失败', err, '无法更新DockerHub详细信息');
   
      }
    })
    .finally(function final() {
      $scope.state.actionInProgress = false;
    });
  };

  $scope.removeAction = function(selectedItems) {
    ModalService.confirmDeletion(
      'Do you want to remove the selected registries?',
      function onConfirm(confirmed) {
        if(!confirmed) { return; }
        deleteSelectedRegistries(selectedItems);
      }
    );
  };

  function deleteSelectedRegistries(selectedItems) {
    var actionCount = selectedItems.length;
    angular.forEach(selectedItems, function (registry) {
      RegistryService.deleteRegistry(registry.Id)
      .then(function success() {
        if($rootScope.language==='en_US'){
        Notifications.success('Registry successfully removed', registry.Name);

        } else {
         Notifications.success('Registry已成功删除', registry.Name);
       
        }
        var index = $scope.registries.indexOf(registry);
        $scope.registries.splice(index, 1);
      })
      .catch(function error(err) {
        if($rootScope.language==='en_US'){
        Notifications.error('Failure', err, 'Unable to remove registry');

        } else {
          Notifications.error('失败', err, '无法删除registry');
      
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

  function initView() {
    $q.all({
      registries: RegistryService.registries(),
      dockerhub: DockerHubService.dockerhub()
    })
    .then(function success(data) {
      $scope.registries = data.registries;
      $scope.dockerhub = data.dockerhub;
    })
    .catch(function error(err) {
      $scope.registries = [];
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to retrieve registries');

      } else {
       Notifications.error('失败', err, '无法检索registries');
     
      }
    });
  }

  initView();
}]);
