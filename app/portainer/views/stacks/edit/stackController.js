angular.module('portainer.app')
.controller('StackController', ['$rootScope', '$q', '$scope', '$state', '$transition$', 'StackService', 'NodeService', 'ServiceService', 'TaskService', 'ContainerService', 'ServiceHelper', 'TaskHelper', 'Notifications', 'FormHelper', 'EndpointProvider', 'EndpointService', 'GroupService', 'ModalService',
function ($rootScope, $q, $scope, $state, $transition$, StackService, NodeService, ServiceService, TaskService, ContainerService, ServiceHelper, TaskHelper, Notifications, FormHelper, EndpointProvider, EndpointService, GroupService, ModalService) {

  $scope.state = {
    actionInProgress: false,
    migrationInProgress: false,
    externalStack: false,
    showEditorTab: false
  };

  $scope.formValues = {
    Prune: false,
    Endpoint: null
  };

  $scope.duplicateStack = function duplicateStack(name, endpointId) {
    var stack = $scope.stack;
    var env = FormHelper.removeInvalidEnvVars(stack.Env);
    EndpointProvider.setEndpointID(endpointId);

    return StackService.duplicateStack(name, $scope.stackFileContent,  env, endpointId, stack.Type)
      .then(onDuplicationSuccess)
      .catch(notifyOnError);

    function onDuplicationSuccess() {
      if($rootScope.language==='en_US'){
      Notifications.success('Stack successfully duplicated');

      } else {
       Notifications.success('堆栈成功复制');
     
      }
      $state.go('portainer.stacks', {}, { reload: true });
      EndpointProvider.setEndpointID(stack.EndpointId);

    }

    function notifyOnError(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to duplicate stack');

      } else {
      Notifications.error('失败', err, '无法复制堆栈');
      
      }
    }
  };

  $scope.showEditor = function() {
    $scope.state.showEditorTab = true;
  };

  $scope.migrateStack = function (name, endpointId) {
    return $q(function (resolve) {
      ModalService.confirm({
        title: 'Are you sure?',
        message: 'This action will deploy a new instance of this stack on the target endpoint, please note that this does NOT relocate the content of any persistent volumes that may be attached to this stack.',
        buttons: {
          confirm: {
            label: 'Migrate',
            className: 'btn-danger'
          }
        },
        callback: function onConfirm(confirmed) {
          if (!confirmed) { return resolve(); }
          return resolve(migrateStack(name, endpointId));
        }
      });
    });
  };

  $scope.removeStack = function() {
    ModalService.confirmDeletion(
      'Do you want to remove the stack? Associated services will be removed as well.',
      function onConfirm(confirmed) {
        if(!confirmed) { return; }
        deleteStack();
      }
    );
  };

  function migrateStack(name, endpointId) {
    var stack = $scope.stack;
    var targetEndpointId = endpointId;

    var migrateRequest = StackService.migrateSwarmStack;
    if (stack.Type === 2) {
      migrateRequest = StackService.migrateComposeStack;
    }

    // TODO: this is a work-around for stacks created with Portainer version >= 1.17.1
    // The EndpointID property is not available for these stacks, we can pass
    // the current endpoint identifier as a part of the migrate request. It will be used if
    // the EndpointID property is not defined on the stack.
    var originalEndpointId = EndpointProvider.endpointID();
    if (stack.EndpointId === 0) {
      stack.EndpointId = originalEndpointId;
    }

    $scope.state.migrationInProgress = true;
    return migrateRequest(stack, targetEndpointId, name)
    .then(function success() {
      if($rootScope.language==='en_US'){
      Notifications.success('Stack successfully migrated', stack.Name);

      } else {
       Notifications.success('堆栈已成功迁移', stack.Name);
     
      }
      $state.go('portainer.stacks', {}, {reload: true});
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to migrate stack');

      } else {
       Notifications.error('失败', err, '无法迁移堆栈');
     
      }
    })
    .finally(function final() {
      $scope.state.migrationInProgress = false;
    });
  }

  function deleteStack() {
    var endpointId = EndpointProvider.endpointID();
    var stack = $scope.stack;

    StackService.remove(stack, $transition$.params().external, endpointId)
    .then(function success() {
      if($rootScope.language==='en_US'){
      Notifications.success('Stack successfully removed', stack.Name);

      } else {
      Notifications.success('堆栈已成功删除', stack.Name);
      
      }
      $state.go('portainer.stacks');
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to remove stack ' + stack.Name);

      } else {
      Notifications.error('失败', err, '无法删除堆栈' + stack.Name);
      
      }
    });
  }

  $scope.deployStack = function () {
    var stackFile = $scope.stackFileContent;
    var env = FormHelper.removeInvalidEnvVars($scope.stack.Env);
    var prune = $scope.formValues.Prune;
    var stack = $scope.stack;

    // TODO: this is a work-around for stacks created with Portainer version >= 1.17.1
  	// The EndpointID property is not available for these stacks, we can pass
    // the current endpoint identifier as a part of the update request. It will be used if
    // the EndpointID property is not defined on the stack.
    var endpointId = EndpointProvider.endpointID();
    if (stack.EndpointId === 0) {
      stack.EndpointId = endpointId;
    }

    $scope.state.actionInProgress = true;
    StackService.updateStack(stack, stackFile, env, prune)
    .then(function success() {
      if($rootScope.language==='en_US'){
      Notifications.success('Stack successfully deployed');

      } else {
         Notifications.success('堆栈已成功部署');
   
      }
      $state.reload();
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
        
      Notifications.error('Failure', err, 'Unable to create stack');

      } else {
            Notifications.error('失败', err, '无法创建堆栈');

      }
    })
    .finally(function final() {
      $scope.state.actionInProgress = false;
    });
  };

  $scope.addEnvironmentVariable = function() {
    $scope.stack.Env.push({ name: '', value: ''});
  };

  $scope.removeEnvironmentVariable = function(index) {
    $scope.stack.Env.splice(index, 1);
  };

  $scope.editorUpdate = function(cm) {
    $scope.stackFileContent = cm.getValue();
  };

  function loadStack(id) {
    var agentProxy = $scope.applicationState.endpoint.mode.agentProxy;

    $q.all({
      stack: StackService.stack(id),
      endpoints: EndpointService.endpoints(),
      groups: GroupService.groups()
    })
    .then(function success(data) {
      var stack = data.stack;
      $scope.endpoints = data.endpoints;
      $scope.groups = data.groups;
      $scope.stack = stack;

      return $q.all({
        stackFile: StackService.getStackFile(id),
        resources: stack.Type === 1 ? retrieveSwarmStackResources(stack.Name, agentProxy) : retrieveComposeStackResources(stack.Name)
      });
    })
    .then(function success(data) {
      $scope.stackFileContent = data.stackFile;
      if ($scope.stack.Type === 1) {
        assignSwarmStackResources(data.resources, agentProxy);
      } else {
        assignComposeStackResources(data.resources);
      }
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to retrieve stack details');

      } else {
      Notifications.error('失败', err, '无法检索堆栈详细信息');
      
      }
    });
  }

  function retrieveSwarmStackResources(stackName, agentProxy) {
    var stackFilter = {
      label: ['com.docker.stack.namespace=' + stackName]
    };

    return $q.all({
      services: ServiceService.services(stackFilter),
      tasks: TaskService.tasks(stackFilter),
      containers: agentProxy ? ContainerService.containers(1) : [],
      nodes: NodeService.nodes()
    });
  }

  function assignSwarmStackResources(resources, agentProxy) {
    var services = resources.services;
    var tasks = resources.tasks;

    if (agentProxy) {
      var containers = resources.containers;
      for (var j = 0; j < tasks.length; j++) {
        var task = tasks[j];
        TaskHelper.associateContainerToTask(task, containers);
      }
    }

    for (var i = 0; i < services.length; i++) {
      var service = services[i];
      ServiceHelper.associateTasksToService(service, tasks);
    }

    $scope.nodes = resources.nodes;
    $scope.tasks = tasks;
    $scope.services = services;
  }

  function retrieveComposeStackResources(stackName) {
    var stackFilter = {
      label: ['com.docker.compose.project=' + stackName]
    };

    return $q.all({
      containers: ContainerService.containers(1, stackFilter)
    });
  }

  function assignComposeStackResources(resources) {
    $scope.containers = resources.containers;
  }

  function loadExternalStack(name) {
    var stackType = $transition$.params().type;
    if (!stackType || (stackType !== '1' && stackType !== '2')) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Invalid type URL parameter.');

      } else {
       Notifications.error('失败', err, '无效的类型URL参数。');
     
      }
      return;
    }

    if (stackType === '1') {
      loadExternalSwarmStack(name);
    } else {
      loadExternalComposeStack(name);
    }
  }

  function loadExternalSwarmStack(name) {
    var agentProxy = $scope.applicationState.endpoint.mode.agentProxy;

    retrieveSwarmStackResources(name, agentProxy)
    .then(function success(data) {
      assignSwarmStackResources(data, agentProxy);
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to retrieve stack details');

      } else {
      Notifications.error('失败', err, '无法检索堆栈详细信息');
      
      }
    });
  }

  function loadExternalComposeStack(name) {
    retrieveComposeStackResources(name)
    .then(function success(data) {
      assignComposeStackResources(data);
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to retrieve stack details');

      } else {
         Notifications.error('失败', err, '无法检索堆栈详细信息');
   
      }
    });
  }

  function initView() {
    var stackName = $transition$.params().name;
    $scope.stackName = stackName;
    var external = $transition$.params().external;
    $scope.currentEndpointId = EndpointProvider.endpointID();

    if (external === 'true') {
      $scope.state.externalStack = true;
      loadExternalStack(stackName);
    } else {
      var stackId = $transition$.params().id;
      loadStack(stackId);
    }
  }

  initView();
}]);
