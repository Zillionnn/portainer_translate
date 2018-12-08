angular.module('portainer.app')
.controller('CreateTemplateController', ['$rootScope', '$q', '$scope', '$state', 'TemplateService', 'TemplateHelper', 'NetworkService', 'Notifications',
function ($rootScope, $q, $scope, $state, TemplateService, TemplateHelper, NetworkService, Notifications) {

  $scope.state = {
    actionInProgress: false
  };

  $scope.create = function() {
    var model = $scope.model;

    $scope.state.actionInProgress = true;
    TemplateService.create(model)
    .then(function success() {
      if($rootScope.language==='en_US'){
      Notifications.success('Template successfully created', model.Title);

      } else {
       Notifications.success('模板已成功创建', model.Title);
     
      }
      $state.go('portainer.templates');
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to create template');

      } else {
        Notifications.error('失败', err, '无法创建模板');
    
      }
    })
    .finally(function final() {
      $scope.state.actionInProgress = false;
    });
  };

  function initView() {
    $scope.model = new TemplateDefaultModel();
    var provider = $scope.applicationState.endpoint.mode.provider;
    var apiVersion = $scope.applicationState.endpoint.apiVersion;

    $q.all({
      templates: TemplateService.templates(),
      networks: NetworkService.networks(
        provider === 'DOCKER_STANDALONE' || provider === 'DOCKER_SWARM_MODE',
        false,
        provider === 'DOCKER_SWARM_MODE' && apiVersion >= 1.25
      )
    })
    .then(function success(data) {
      $scope.categories = TemplateHelper.getUniqueCategories(data.templates);
      $scope.networks = data.networks;
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to retrieve template details');

      } else {
      Notifications.error('失败', err, '无法检索模板详细信息');
      
      }
    });
  }

  initView();
}]);
