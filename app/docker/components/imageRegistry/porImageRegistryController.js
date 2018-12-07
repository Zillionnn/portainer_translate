angular.module('portainer.docker')
.controller('$rootScope', 'porImageRegistryController', ['$q', 'RegistryService', 'DockerHubService', 'ImageService', 'Notifications',
function ($q, RegistryService, DockerHubService, ImageService, Notifications) {
  var ctrl = this;

  function initComponent() {
    $q.all({
      registries: RegistryService.registries(),
      dockerhub: DockerHubService.dockerhub(),
      availableImages: ctrl.autoComplete ? ImageService.images() : []
    })
    .then(function success(data) {
      var dockerhub = data.dockerhub;
      var registries = data.registries;
      ctrl.availableImages = ImageService.getUniqueTagListFromImages(data.availableImages);
      ctrl.availableRegistries = [dockerhub].concat(registries);
      if (!ctrl.registry.Id) {
        ctrl.registry = dockerhub;
      } else {
        ctrl.registry = _.find(ctrl.availableRegistries, { 'Id': ctrl.registry.Id });
      }
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to retrieve registries');

      } else {
      Notifications.error('失败', err, '无法检索registries');
    
      }
    });
  }

  initComponent();
}]);
