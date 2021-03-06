angular.module('portainer.docker')
  .controller('NetworkMacvlanFormController', ['$rootScope', '$q', 'NodeService', 'NetworkService', 'Notifications', 'StateManager', 'Authentication',
    function ($rootScope, $q, NodeService, NetworkService, Notifications, StateManager, Authentication) {
      var ctrl = this;

      ctrl.requiredNodeSelection = function () {
        if (ctrl.data.Scope !== 'local' || ctrl.data.DatatableState === undefined) {
          return false;
        }
        return ctrl.data.DatatableState.selectedItemCount === 0;
      };

      ctrl.requiredConfigSelection = function () {
        if (ctrl.data.Scope !== 'swarm') {
          return false;
        }
        return !ctrl.data.SelectedNetworkConfig;
      };

      function initComponent() {
        if (StateManager.getState().application.authentication) {
          var userDetails = Authentication.getUserDetails();
          var isAdmin = userDetails.role === 1 ? true : false;
          ctrl.isAdmin = isAdmin;
        }
        var provider = ctrl.applicationState.endpoint.mode.provider;
        var apiVersion = ctrl.applicationState.endpoint.apiVersion;
        $q.all({
            nodes: provider !== 'DOCKER_SWARM_MODE' || NodeService.nodes(),
            networks: NetworkService.networks(
              provider === 'DOCKER_STANDALONE' || provider === 'DOCKER_SWARM_MODE',
              false,
              provider === 'DOCKER_SWARM_MODE' && apiVersion >= 1.25
            )
          })
          .then(function success(data) {
            if (data.nodes !== true) {
              ctrl.nodes = data.nodes;
            }
            ctrl.availableNetworks = data.networks.filter(function (item) {
              return item.ConfigOnly === true;
            });
          })
          .catch(function error(err) {
            if($rootScope.language==='en_US'){
            Notifications.error('Failure', err, 'Unable to retrieve informations for macvlan');

            } else {
            Notifications.error('失败', err, '无法检索macvlan的信息');
   
            }
          });
      }

      initComponent();
    }
  ]);