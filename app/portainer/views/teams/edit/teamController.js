angular.module('portainer.app')
.controller('TeamController', ['$rootScope', '$q', '$scope', '$state', '$transition$', 'TeamService', 'UserService', 'TeamMembershipService', 'ModalService', 'Notifications', 'PaginationService', 'Authentication',
function ($rootScope, $q, $scope, $state, $transition$, TeamService, UserService, TeamMembershipService, ModalService, Notifications, PaginationService, Authentication) {

  $scope.state = {
    pagination_count_users: PaginationService.getPaginationLimit('team_available_users'),
    pagination_count_members: PaginationService.getPaginationLimit('team_members')
  };
  $scope.sortTypeUsers = 'Username';
  $scope.sortReverseUsers = true;
  $scope.users = [];
  $scope.teamMembers = [];
  $scope.leaderCount = 0;

  $scope.orderUsers = function(sortType) {
    $scope.sortReverseUsers = ($scope.sortTypeUsers === sortType) ? !$scope.sortReverseUsers : false;
    $scope.sortTypeUsers = sortType;
  };

  $scope.changePaginationCountUsers = function() {
    PaginationService.setPaginationLimit('team_available_users', $scope.state.pagination_count_users);
  };

  $scope.sortTypeGroupMembers = 'TeamRole';
  $scope.sortReverseGroupMembers = false;

  $scope.orderGroupMembers = function(sortType) {
    $scope.sortReverseGroupMembers = ($scope.sortTypeGroupMembers === sortType) ? !$scope.sortReverseGroupMembers : false;
    $scope.sortTypeGroupMembers = sortType;
  };

  $scope.changePaginationCountGroupMembers = function() {
    PaginationService.setPaginationLimit('team_members', $scope.state.pagination_count_members);
  };

  $scope.deleteTeam = function() {
    ModalService.confirmDeletion(
      'Do you want to delete this team? Users in this team will not be deleted.',
      function onConfirm(confirmed) {
        if(!confirmed) { return; }
        deleteTeam();
      }
    );
  };

  $scope.promoteToLeader = function(user) {
    TeamMembershipService.updateMembership(user.MembershipId, user.Id, $scope.team.Id, 1)
    .then(function success() {
      $scope.leaderCount++;
      user.TeamRole = 'Leader';
      
      if($rootScope.language==='en_US'){
      Notifications.success('User is now team leader', user.Username);

      } else {
        Notifications.success('用户现在是团队领导者', user.Username);
    
      }
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to update user role');

      } else {
        Notifications.error('失败', err, '无法更新用户角色');
    
      }
    });
  };

  $scope.demoteToMember = function(user) {
    TeamMembershipService.updateMembership(user.MembershipId, user.Id, $scope.team.Id, 2)
    .then(function success() {
      user.TeamRole = 'Member';
      $scope.leaderCount--;
      if($rootScope.language==='en_US'){
      Notifications.success('User is now team member', user.Username);

      } else {
        Notifications.success('用户现在是团队成员', user.Username);
    
      }
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to update user role');

      } else {
        Notifications.error('失败', err, '无法更新用户角色');
    
      }
    });
  };

  $scope.addAllUsers = function() {
    var teamMembershipQueries = [];
    angular.forEach($scope.users, function (user) {
      teamMembershipQueries.push(TeamMembershipService.createMembership(user.Id, $scope.team.Id, 2));
    });
    $q.all(teamMembershipQueries)
    .then(function success(data) {
      var users = $scope.users;
      for (var i = 0; i < users.length; i++) {
        var user = users[i];
        user.MembershipId = data[i].Id;
        user.TeamRole = 'Member';
      }
      $scope.teamMembers = $scope.teamMembers.concat(users);
      $scope.users = [];
      if($rootScope.language==='en_US'){
      Notifications.success('All users successfully added');

      } else {
        Notifications.success('所有用户都成功添加');
    
      }
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to update team members');

      } else {
       Notifications.error('失败', err, '无法更新团队成员');
     
      }
    });
  };

  $scope.addUser = function(user) {
    TeamMembershipService.createMembership(user.Id, $scope.team.Id, 2)
    .then(function success(data) {
      removeUserFromArray(user.Id, $scope.users);
      user.TeamRole = 'Member';
      user.MembershipId = data.Id;
      $scope.teamMembers.push(user);
      if($rootScope.language==='en_US'){
      Notifications.success('User added to team', user.Username);

      } else {
        Notifications.success('用户已添加到团队中', user.Username);
    
      }
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to update team members');

      } else {
      Notifications.error('失败', err, '无法更新团队成员');
      
      }
    });
  };

  $scope.removeAllUsers = function() {
    var teamMembershipQueries = [];
    angular.forEach($scope.teamMembers, function (user) {
      teamMembershipQueries.push(TeamMembershipService.deleteMembership(user.MembershipId));
    });
    $q.all(teamMembershipQueries)
    .then(function success() {
      $scope.users = $scope.users.concat($scope.teamMembers);
      $scope.teamMembers = [];
      if($rootScope.language==='en_US'){
      Notifications.success('All users successfully removed');

      } else {
        Notifications.success('已成功删除所有用户');
    
      }
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
Notifications.error('Failure', err, 'Unable to update team members');
      } else {
  Notifications.error('失败', err, '无法更新团队成员');    
      }
      
    });
  };

  $scope.removeUser = function(user) {
    TeamMembershipService.deleteMembership(user.MembershipId)
    .then(function success() {
      removeUserFromArray(user.Id, $scope.teamMembers);
      $scope.users.push(user);
      if($rootScope.language==='en_US'){
      Notifications.success('User removed from team', user.Username);

      } else {
       Notifications.success('用户从团队中删除', user.Username);
     
      }
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to update team members');

      } else {
      Notifications.error('失败', err, '无法更新团队成员');
      
      }
    });
  };

  function deleteTeam() {
    TeamService.deleteTeam($scope.team.Id)
    .then(function success() {
      if($rootScope.language==='en_US'){
      Notifications.success('Team successfully deleted', $scope.team.Name);

      } else {
       Notifications.success('团队成功删除', $scope.team.Name);
     
      }
      $state.go('portainer.teams');
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to remove team');

      } else {
         Notifications.error('失败', err, '无法删除团队');
   
      }
    });
  }

  function removeUserFromArray(id, users) {
    for (var i = 0, l = users.length; i < l; i++) {
      if (users[i].Id === id) {
        users.splice(i, 1);
        return;
      }
    }
  }

  function assignUsersAndMembers(users, memberships) {
    for (var i = 0; i < users.length; i++) {
      var user = users[i];
      var member = false;
      for (var j = 0; j < memberships.length; j++) {
        var membership = memberships[j];
        if (user.Id === membership.UserId) {
          member = true;
          if (membership.Role === 1) {
            user.TeamRole = 'Leader';
            $scope.leaderCount++;
          } else {
            user.TeamRole = 'Member';
          }
          user.MembershipId = membership.Id;
          $scope.teamMembers.push(user);
          break;
        }
      }
      if (!member) {
        $scope.users.push(user);
      }
    }
  }

  function initView() {
    $scope.isAdmin = Authentication.getUserDetails().role === 1 ? true: false;
    $q.all({
      team: TeamService.team($transition$.params().id),
      users: UserService.users(false),
      memberships: TeamService.userMemberships($transition$.params().id)
    })
    .then(function success(data) {
      var users = data.users;
      $scope.team = data.team;
      assignUsersAndMembers(users, data.memberships);
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to retrieve team details');

      } else {
        Notifications.error('失败', err, '无法检索团队详细信息');
    
      }
    });
  }

  initView();
}]);
