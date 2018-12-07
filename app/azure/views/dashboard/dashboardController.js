angular.module('portainer.azure')
.controller('AzureDashboardController', ['$rootScope', '$scope', 'AzureService', 'Notifications',
function ($rootScope, $scope, AzureService, Notifications) {
  var language = $rootScope.language;

  function initView() {
    AzureService.subscriptions()
    .then(function success(data) {
      var subscriptions = data;
      $scope.subscriptions = subscriptions;
      return AzureService.resourceGroups(subscriptions);
    })
    .then(function success(data) {
      $scope.resourceGroups = AzureService.aggregate(data);
    })
    .catch(function error(err) {
      if(language==='en_US'){
        Notifications.error('Failure', err, 'Unable to load dashboard data');

      } else {
         Notifications.error('失败', err, '无法加载仪表板数据');

      }
    });
  }

  initView();
}]);
