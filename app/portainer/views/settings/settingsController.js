angular.module('portainer.app')
.controller('SettingsController', ['$rootScope', '$scope', '$state', 'Notifications', 'SettingsService', 'StateManager', 
function ($rootScope, $scope, $state, Notifications, SettingsService, StateManager) {

  $scope.state = {
    actionInProgress: false
  };

  $scope.formValues = {
    customLogo: false,
    externalTemplates: false,
    restrictBindMounts: false,
    restrictPrivilegedMode: false,
    labelName: '',
    labelValue: ''
  };

  $scope.removeFilteredContainerLabel = function(index) {
    var settings = $scope.settings;
    settings.BlackListedLabels.splice(index, 1);

    updateSettings(settings);
  };

  $scope.addFilteredContainerLabel = function() {
    var settings = $scope.settings;
    var label = {
      name: $scope.formValues.labelName,
      value: $scope.formValues.labelValue
    };
    settings.BlackListedLabels.push(label);

    updateSettings(settings);
  };

  $scope.saveApplicationSettings = function() {
    var settings = $scope.settings;

    if (!$scope.formValues.customLogo) {
      settings.LogoURL = '';
    }

    if (!$scope.formValues.externalTemplates) {
      settings.TemplatesURL = '';
    }

    settings.AllowBindMountsForRegularUsers = !$scope.formValues.restrictBindMounts;
    settings.AllowPrivilegedModeForRegularUsers = !$scope.formValues.restrictPrivilegedMode;

    $scope.state.actionInProgress = true;
    updateSettings(settings);
  };

  function updateSettings(settings) {
    SettingsService.update(settings)
    .then(function success() {
      if($rootScope.language==='en_US'){
      Notifications.success('Settings updated');

      } else {
         Notifications.success('设置更新');
   
      }
      StateManager.updateLogo(settings.LogoURL);
      StateManager.updateSnapshotInterval(settings.SnapshotInterval);
      $state.reload();
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to update settings');

      } else {
       Notifications.error('失败', err, '无法更新设置');
     
      }
    })
    .finally(function final() {
      $scope.state.actionInProgress = false;
    });
  }

  function initView() {
    SettingsService.settings()
    .then(function success(data) {
      var settings = data;
      $scope.settings = settings;
      if (settings.LogoURL !== '') {
        $scope.formValues.customLogo = true;
      }
      if (settings.TemplatesURL !== '') {
        $scope.formValues.externalTemplates = true;
      }
      $scope.formValues.restrictBindMounts = !settings.AllowBindMountsForRegularUsers;
      $scope.formValues.restrictPrivilegedMode = !settings.AllowPrivilegedModeForRegularUsers;
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to retrieve application settings');

      } else {
      Notifications.error('失败', err, '无法检索应用程序设置');
      
      }
    });
  }

  initView();
}]);
