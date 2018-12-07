angular.module('portainer.docker').controller('HostBrowserViewController', ['$rootScope',
  'SystemService', 'Notifications',
  function HostBrowserViewController($rootScope, SystemService, Notifications) {
    var ctrl = this;
    ctrl.$onInit = $onInit;

    function $onInit() {
      SystemService.info()
      .then(function onInfoLoaded(host) {
        ctrl.host = host;
      })
      .catch(function onError(err) {
        if($rootScope.language==='en_US'){
        Notifications.error('Unable to retrieve host information', err);

        } else {
         Notifications.error('无法检索主机信息', err);
       }
      });
    }
  }
]);
