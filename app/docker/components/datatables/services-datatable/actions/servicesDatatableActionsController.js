angular.module('portainer.docker')
.controller('ServicesDatatableActionsController', ['$rootScope', '$q', '$state', 'ServiceService', 'ServiceHelper', 'Notifications', 'ModalService', 'ImageHelper','WebhookService','EndpointProvider',
function ($rootScope, $q, $state, ServiceService, ServiceHelper, Notifications, ModalService, ImageHelper, WebhookService, EndpointProvider) {
  var language = $rootScope.language;

  this.scaleAction = function scaleService(service) {
    var config = ServiceHelper.serviceToConfig(service.Model);
    config.Mode.Replicated.Replicas = service.Replicas;
    ServiceService.update(service, config)
    .then(function success() {
      if(language==='en_US'){
      Notifications.success('Service successfully scaled', 'New replica count: ' + service.Replicas);

      } else {
      Notifications.success('服务成功扩展', '新复制计数： ' + service.Replicas);
          
      }
      $state.reload();
    })
    .catch(function error(err) {
      if(language==='en_US'){
      Notifications.error('Failure', err, 'Unable to scale service');

      } else {
       Notifications.error('失败', err, '无法扩展服务');
       
      }
      service.Scale = false;
      service.Replicas = service.ReplicaCount;
    });
  };

  this.removeAction = function(selectedItems) {
    ModalService.confirmDeletion(
      'Do you want to remove the selected service(s)? All the containers associated to the selected service(s) will be removed too.',
      function onConfirm(confirmed) {
        if(!confirmed) { return; }
        removeServices(selectedItems);
      }
    );
  };

  this.updateAction = function(selectedItems) {
    ModalService.confirmServiceForceUpdate(
      'Do you want to force an update of the selected service(s)? All the tasks associated to the selected service(s) will be recreated.',
      function (result) {
        if(!result) { return; }
        var pullImage = false;
        if (result[0]) {
          pullImage = true;
        }
        forceUpdateServices(selectedItems, pullImage);
      }
    );
  };

  function forceUpdateServices(services, pullImage) {
    var actionCount = services.length;
    angular.forEach(services, function (service) {
      var config = ServiceHelper.serviceToConfig(service.Model);
      if (pullImage) {
        config.TaskTemplate.ContainerSpec.Image = ImageHelper.removeDigestFromRepository(config.TaskTemplate.ContainerSpec.Image);
      }

      // As explained in https://github.com/docker/swarmkit/issues/2364 ForceUpdate can accept a random
      // value or an increment of the counter value to force an update.
      config.TaskTemplate.ForceUpdate++;
      ServiceService.update(service, config)
      .then(function success() {
        if(language==='en_US'){
        Notifications.success('Service successfully updated', service.Name);

        } else {
        Notifications.success('服务已成功更新', service.Name);
            
        }
      })
      .catch(function error(err) {
        if(language==='en_US'){
          Notifications.error('Failure', err, 'Unable to force update service', service.Name);

        } else {
          Notifications.error('失败', err, '无法强制更新服务', service.Name);
         
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

  function removeServices(services) {
    var actionCount = services.length;
    angular.forEach(services, function (service) {

      ServiceService.remove(service)
      .then(function success() {
        return WebhookService.webhooks(service.Id, EndpointProvider.endpointID());
      })
      .then(function success(data) {
        return $q.when(data.length !== 0 && WebhookService.deleteWebhook(data[0].Id));
      })
      .then(function success() {
        if(language==='en_US'){
        Notifications.success('Service successfully removed', service.Name);

        } else {
        Notifications.success('服务已成功删除', service.Name);
    
        }
      })
      .catch(function error(err) {
        if(language==='en_US'){
        Notifications.error('Failure', err, 'Unable to remove service');

        } else {
        Notifications.error('失败', err, '无法删除服务');
 
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
}]);
