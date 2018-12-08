angular.module('portainer.app')
  .controller('SidebarController', ['$rootScope', '$q', '$scope', 'StateManager', 'Notifications', 'Authentication', 'UserService',
    function ($rootScope, $q, $scope, StateManager, Notifications, Authentication, UserService) {

      function checkPermissions(memberships) {
        var isLeader = false;
        angular.forEach(memberships, function (membership) {
          if (membership.Role === 1) {
            isLeader = true;
          }
        });
        $scope.isTeamLeader = isLeader;
      }

      function initView() {
        $scope.uiVersion = StateManager.getState().application.version;
        $scope.logo = StateManager.getState().application.logo;

        var authenticationEnabled = $scope.applicationState.application.authentication;
        if (authenticationEnabled) {
          var userDetails = Authentication.getUserDetails();
          var isAdmin = userDetails.role === 1;
          $scope.isAdmin = isAdmin;

          $q.when(!isAdmin ? UserService.userMemberships(userDetails.ID) : [])
            .then(function success(data) {
              checkPermissions(data);
            })
            .catch(function error(err) {
              if($rootScope.language==='en_US'){
              Notifications.error('Failure', err, 'Unable to retrieve user memberships');

              } else {
             Notifications.error('失败', err, '无法检索用户成员身份');
        
              }
            });
        }
      }

      initView();
    }
  ]);