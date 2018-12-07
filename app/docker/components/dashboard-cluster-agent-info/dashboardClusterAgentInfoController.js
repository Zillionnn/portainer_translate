angular.module('portainer.docker')
.controller('DashboardClusterAgentInfoController', ['$rootScope', 'AgentService', 'Notifications',
function ($rootScope, AgentService, Notifications) {
  var ctrl = this;
  var language = $rootScope.language;

  this.$onInit = function() {
    AgentService.agents()
    .then(function success(data) {
      ctrl.agentCount = data.length;
    })
    .catch(function error(err) {
      if(language==='en_US'){
      Notifications.error('Failure', err, 'Unable to retrieve agent information');

      } else {
        Notifications.error('失败', err, '无法检索代理商信息');
      }
    });
  };

}]);
