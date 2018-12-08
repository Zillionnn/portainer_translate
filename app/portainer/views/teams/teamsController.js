angular.module('portainer.app')
.controller('TeamsController', ['$rootScope', '$q', '$scope', '$state', '$sanitize', 'TeamService', 'UserService', 'ModalService', 'Notifications', 'Authentication',
function ($rootScope, $q, $scope, $state, $sanitize, TeamService, UserService, ModalService, Notifications, Authentication) {
  $scope.state = {
    actionInProgress: false
  };

  $scope.formValues = {
    Name: '',
    Leaders: []
  };

  $scope.checkNameValidity = function(form) {
    var valid = true;
    for (var i = 0; i < $scope.teams.length; i++) {
      if ($scope.formValues.Name === $scope.teams[i].Name) {
        valid = false;
        break;
      }
    }
    form.team_name.$setValidity('validName', valid);
  };

  $scope.addTeam = function() {
    var teamName = $sanitize($scope.formValues.Name);
    var leaderIds = [];
    angular.forEach($scope.formValues.Leaders, function(user) {
      leaderIds.push(user.Id);
    });

    $scope.state.actionInProgress = true;
    TeamService.createTeam(teamName, leaderIds)
    .then(function success() {
      if($rootScope.language==='en_US'){
      Notifications.success('Team successfully created', teamName);

      } else {
       Notifications.success('团队成功创建', teamName);
     
      }
      $state.reload();
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to create team');

      } else {
      Notifications.error('失败', err, '无法创建团队');
      
      }
    })
    .finally(function final() {
      $scope.state.actionInProgress = false;
    });
  };

  $scope.removeAction = function (selectedItems) {
    ModalService.confirmDeletion(
      'Do you want to delete the selected team(s)? Users in the team(s) will not be deleted.',
      function onConfirm(confirmed) {
        if(!confirmed) { return; }
        deleteSelectedTeams(selectedItems);
      }
    );
  };

  function deleteSelectedTeams(selectedItems) {
    var actionCount = selectedItems.length;
    angular.forEach(selectedItems, function (team) {
      TeamService.deleteTeam(team.Id)
      .then(function success() {
        if($rootScope.language==='en_US'){
        Notifications.success('Team successfully removed', team.Name);

        } else {
          Notifications.success('团队成功删除', team.Name);
      
        }
        var index = $scope.teams.indexOf(team);
        $scope.teams.splice(index, 1);
      })
      .catch(function error(err) {
        if($rootScope.language==='en_US'){
        Notifications.error('Failure', err, 'Unable to remove team');

        } else {
        Notifications.error('失败', err, '无法删除团队');
        
        }
      })
      .finally(function final() {
        --actionCount;
        if (actionCount === 0) {
          $state.reload();
        }
      });
    });
  }

  function initView() {
    var userDetails = Authentication.getUserDetails();
    var isAdmin = userDetails.role === 1 ? true: false;
    $scope.isAdmin = isAdmin;
    $q.all({
      users: UserService.users(false),
      teams: isAdmin ? TeamService.teams() : UserService.userLeadingTeams(userDetails.ID)
    })
    .then(function success(data) {
      $scope.teams = data.teams;
      $scope.users = data.users;
    })
    .catch(function error(err) {
      $scope.teams = [];
      $scope.users = [];
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to retrieve teams');

      } else {
      Notifications.error('失败', err, '无法检索团队');
      
      }
    });
  }

  initView();
}]);
