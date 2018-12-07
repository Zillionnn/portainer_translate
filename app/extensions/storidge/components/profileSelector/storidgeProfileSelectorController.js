angular.module('extension.storidge')
.controller('StoridgeProfileSelectorController', ['$rootScope','StoridgeProfileService', 'Notifications',
function ($rootScope, StoridgeProfileService, Notifications) {
  var ctrl = this;

  function initComponent() {
    StoridgeProfileService.profiles()
    .then(function success(data) {
      ctrl.profiles = data;
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to retrieve Storidge profiles');

      } else {
          Notifications.error('失败', err, '无法检索Storidge配置文件');

      }
    });
  }

  initComponent();
}]);
