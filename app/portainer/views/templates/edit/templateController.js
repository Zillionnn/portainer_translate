angular.module('portainer.app')
.controller('TemplateController', ['$rootScope', '$q', '$scope', '$state', '$transition$', 'TemplateService', 'TemplateHelper', 'NetworkService', 'Notifications',
function ($rootScope, $q, $scope, $state, $transition$, TemplateService, TemplateHelper, NetworkService, Notifications) {

  $scope.state = {
    actionInProgress: false
  };

  $scope.update = function() {
    var model = $scope.template;

    $scope.state.actionInProgress = true;
    TemplateService.update(model)
    .then(function success() {
      if($rootScope.language==='en_US'){
      Notifications.success('Template successfully updated', model.Title);

      } else {
      Notifications.success('模板已成功更新', model.Title);
      
      }
      $state.go('portainer.templates');
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to update template');

      } else {
        Notifications.error('失败', err, '无法更新模板');
    
      }
    })
    .finally(function final() {
      $scope.state.actionInProgress = false;
    });
  };

  function initView() {
    var provider = $scope.applicationState.endpoint.mode.provider;
    var apiVersion = $scope.applicationState.endpoint.apiVersion;

    var templateId = $transition$.params().id;
    $q.all({
      templates: TemplateService.templates(),
      template: TemplateService.template(templateId),
      networks: NetworkService.networks(
        provider === 'DOCKER_STANDALONE' || provider === 'DOCKER_SWARM_MODE',
        false,
        provider === 'DOCKER_SWARM_MODE' && apiVersion >= 1.25
      )
    })
    .then(function success(data) {
      var template = data.template;
      if (template.Network) {
        template.Network = _.find(data.networks, function(o) { return o.Name === template.Network; });
      } else {
        template.Network = _.find(data.networks, function(o) { return o.Name === 'bridge'; });
      }
      $scope.categories = TemplateHelper.getUniqueCategories(data.templates);
      $scope.template = data.template;
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
