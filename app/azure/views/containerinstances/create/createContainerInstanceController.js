angular.module('portainer.azure')
.controller('AzureCreateContainerInstanceController', ['$rootScope', '$q', '$scope', '$state', 'AzureService', 'Notifications',
function ($q, $rootScope, $scope, $state, AzureService, Notifications) {

  var allResourceGroups = [];
  var allProviders = [];
  var language = $rootScope.language;

  $scope.state = {
    actionInProgress: false,
    selectedSubscription: null,
    selectedResourceGroup: null
  };

  $scope.changeSubscription = function() {
    var selectedSubscription = $scope.state.selectedSubscription;
    updateResourceGroupsAndLocations(selectedSubscription, allResourceGroups, allProviders);
  };

  $scope.addPortBinding = function() {
    $scope.model.Ports.push({ host: '', container: '', protocol: 'TCP' });
  };

  $scope.removePortBinding = function(index) {
    $scope.model.Ports.splice(index, 1);
  };

  $scope.create = function() {
    var model = $scope.model;
    var subscriptionId = $scope.state.selectedSubscription.Id;
    var resourceGroupName = $scope.state.selectedResourceGroup.Name;

    $scope.state.actionInProgress = true;
    AzureService.createContainerGroup(model, subscriptionId, resourceGroupName)
    .then(function success() {
      if(language==='en_US'){
        Notifications.success('Container successfully created', model.Name);

      } else {
         Notifications.success('容器已成功创建', model.Name);

      }
      $state.go('azure.containerinstances');
    })
    .catch(function error(err) {
      if(language==='en_US'){
        Notifications.error('Failure', err, 'Unable to create container');

      } else {
         Notifications.error('失败', err, '无法创建容器');

      }
    })
    .finally(function final() {
      $scope.state.actionInProgress = false;
    });
  };

  function updateResourceGroupsAndLocations(subscription, resourceGroups, providers) {
    $scope.state.selectedResourceGroup = resourceGroups[subscription.Id][0];
    $scope.resourceGroups = resourceGroups[subscription.Id];

    var currentSubLocations = providers[subscription.Id].Locations;
    $scope.model.Location = currentSubLocations[0];
    $scope.locations = currentSubLocations;
  }

  function initView() {
    var model = new ContainerGroupDefaultModel();

    AzureService.subscriptions()
    .then(function success(data) {
      var subscriptions = data;
      $scope.state.selectedSubscription = subscriptions[0];
      $scope.subscriptions = subscriptions;

      return $q.all({
        resourceGroups: AzureService.resourceGroups(subscriptions),
        containerInstancesProviders: AzureService.containerInstanceProvider(subscriptions)
      });
    })
    .then(function success(data) {
      var resourceGroups = data.resourceGroups;
      allResourceGroups = resourceGroups;

      var containerInstancesProviders = data.containerInstancesProviders;
      allProviders = containerInstancesProviders;

      $scope.model = model;

      var selectedSubscription = $scope.state.selectedSubscription;
      updateResourceGroupsAndLocations(selectedSubscription, resourceGroups, containerInstancesProviders);
    })
    .catch(function error(err) {
      if(language==='en_US'){
Notifications.error('Failure', err, 'Unable to retrieve Azure resources');
      } else {
          Notifications.error('失败', err, '无法检索Azure资源');
      }
      
    });
  }

  initView();
}]);
