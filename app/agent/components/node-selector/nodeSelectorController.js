angular.module('portainer.agent')
.controller('NodeSelectorController', ['$rootScope', 'AgentService', 'Notifications', function (AgentService, Notifications) {
  var ctrl = this;
  var language = $rootScope.language


  this.$onInit = function() {
    AgentService.agents()
    .then(function success(data) {
      ctrl.agents = data;
      if (!ctrl.model) {
        ctrl.model = data[0].NodeName;
      }
    })
    .catch(function error(err) {
      if(language==='en_US'){
        Notifications.error('Failure', err, 'Unable to load agents');
      } else {
        Notifications.error('失败', err, '无法加载代理');
      }
      
    });
  };

}]);
