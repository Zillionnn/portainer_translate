angular.module('portainer.app')
.controller('porAccessManagementController', ['$rootScope', 'AccessService', 'Notifications',
function ($rootScope, AccessService, Notifications) {
  var ctrl = this;

  function dispatchUserAndTeamIDs(accesses, users, teams) {
    angular.forEach(accesses, function (access) {
      if (access.Type === 'user' && !access.Inherited) {
        users.push(access.Id);
      } else if (access.Type === 'team' && !access.Inherited) {
        teams.push(access.Id);
      }
    });
  }

  function processAuthorizedIDs(accesses, authorizedAccesses) {
    var authorizedUserIDs = [];
    var authorizedTeamIDs = [];
    if (accesses) {
      dispatchUserAndTeamIDs(accesses, authorizedUserIDs, authorizedTeamIDs);
    }
    if (authorizedAccesses) {
      dispatchUserAndTeamIDs(authorizedAccesses, authorizedUserIDs, authorizedTeamIDs);
    }
    return {
      userIDs: authorizedUserIDs,
      teamIDs: authorizedTeamIDs
    };
  }

  function removeFromAccesses(access, accesses) {
    _.remove(accesses, function(n) {
      return n.Id === access.Id && n.Type === access.Type;
    });
  }

  function removeFromAccessIDs(accessId, accessIDs) {
    _.remove(accessIDs, function(n) {
      return n === accessId;
    });
  }

  ctrl.authorizeAccess = function(access) {
    var accessData = processAuthorizedIDs(null, ctrl.authorizedAccesses);
    var authorizedUserIDs = accessData.userIDs;
    var authorizedTeamIDs = accessData.teamIDs;

    if (access.Type === 'user') {
      authorizedUserIDs.push(access.Id);
    } else if (access.Type === 'team') {
      authorizedTeamIDs.push(access.Id);
    }

    ctrl.updateAccess({ userAccesses: authorizedUserIDs, teamAccesses: authorizedTeamIDs })
    .then(function success() {
      removeFromAccesses(access, ctrl.accesses);
      ctrl.authorizedAccesses.push(access);
      if($rootScope.language==='en_US'){
      Notifications.success('Accesses successfully updated');

      } else {
          Notifications.success('访问成功更新');

      }
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to update accesses');

      } else {
         Notifications.error('失败', err, '无法更新访问权限');
 
      }
    });
  };

  ctrl.unauthorizeAccess = function(access) {
    var accessData = processAuthorizedIDs(null, ctrl.authorizedAccesses);
    var authorizedUserIDs = accessData.userIDs;
    var authorizedTeamIDs = accessData.teamIDs;

    if (access.Type === 'user') {
      removeFromAccessIDs(access.Id, authorizedUserIDs);
    } else if (access.Type === 'team') {
      removeFromAccessIDs(access.Id, authorizedTeamIDs);
    }

    ctrl.updateAccess({ userAccesses: authorizedUserIDs, teamAccesses: authorizedTeamIDs })
    .then(function success() {
      removeFromAccesses(access, ctrl.authorizedAccesses);
      ctrl.accesses.push(access);
      if($rootScope.language==='en_US'){
      Notifications.success('Accesses successfully updated');

      } else {
          Notifications.success('访问成功更新');

      }
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to update accesses');

      } else {
          Notifications.error('失败', err, '无法更新访问权限');

      }
    });
  };

  function moveAccesses(source, target) {
    for (var i = 0; i < source.length; i++) {
      var access = source[i];
      if (!access.Inherited) {
        target.push(access);
        source.splice(i, 1);
      }
    }
  }

  ctrl.unauthorizeAllAccesses = function() {
    ctrl.updateAccess({ userAccesses: [], teamAccesses: [] })
    .then(function success() {
      moveAccesses(ctrl.authorizedAccesses, ctrl.accesses);
      if($rootScope.language==='en_US'){
      Notifications.success('Accesses successfully updated');

      } else {
          Notifications.success('访问成功更新');

      }
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to update accesses');

      } else {
          Notifications.error('失败', err, '无法更新访问权限');

      }
    });
  };

  ctrl.authorizeAllAccesses = function() {
    var accessData = processAuthorizedIDs(ctrl.accesses, ctrl.authorizedAccesses);
    var authorizedUserIDs = accessData.userIDs;
    var authorizedTeamIDs = accessData.teamIDs;

    ctrl.updateAccess({ userAccesses: authorizedUserIDs, teamAccesses: authorizedTeamIDs })
    .then(function success() {
      moveAccesses(ctrl.accesses, ctrl.authorizedAccesses);
      if($rootScope.language==='en_US'){
      Notifications.success('Accesses successfully updated');

      } else {
       Notifications.success('访问成功更新');
   
      }
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to update accesses');

      } else {
          Notifications.error('失败', err, '无法更新访问权限');

      }
    });
  };

  function initComponent() {
    var entity = ctrl.accessControlledEntity;
    var parent = ctrl.inheritFrom;
    AccessService.accesses(entity.AuthorizedUsers, entity.AuthorizedTeams, parent ? parent.AuthorizedUsers: [], parent ? parent.AuthorizedTeams : [])
    .then(function success(data) {
      ctrl.accesses = data.accesses;
      ctrl.authorizedAccesses = data.authorizedAccesses;
    })
    .catch(function error(err) {
      ctrl.accesses = [];
      ctrl.authorizedAccesses = [];
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to retrieve accesses');

      } else {
          Notifications.error('失败', err, '无法检索访问');

      }
    });
  }

  initComponent();
}]);
