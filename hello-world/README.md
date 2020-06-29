# HelloWorld

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 8.3.19.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).



## Containerizing application to run with either docker, podman, or manually on openshift.
### Prereqs
1. Add Dockerfile to create container image on builder image nginxinc/nginx-unprivileged:1.18-alpine. Titled Dockerfile in this folder.
2. Add a nginx default configuration to handle/forward requests to angular router. Titled nginx-custom-default.conf in this folder.
3. Install dependencies
`npm install`
4. Create spa content to serve on nginx server. Should have code in dist/hello-world
`npm run build`

### Podman Local Container Engine
1. Build actual container image.
`sudo podman build -t angular-hello-world .`
2. Run actual container and forward requests to 8080 which is port nginx is listening on.
`sudo podman run -d -p 8080 angular-hello-world`


### Openshift application binary build/deployment
0. Be in project you want to create app resources in.
`oc project personal-dev`
1. Build actual generic BuildConfig ocp object to work with binary build.
`oc new-build  --name=hello-world --binary=true`
2. Start execution of BuildConfig object with this directory (which uses Dockerfile build container image for binary input) to produce imagestream for our app.
`oc start-build bc/hello-world --from-dir="." --wait=true --follow=true`
3. Create/Start a DeploymentConfig ocp object with the previous image stream as the input/container image.
`oc new-app hello-world:latest`
4. Expose the service created.
`oc expose svc hello-world`
5. To simulate a deployment to a staging environment create the appropriate namespace.
`oc project personal-stage`
6. Promote container image from dev to stage:
`oc tag personal-dev/hello-world:latest personal-stage/hello-world:stage`
7. Deploy hello-world imagestream with tag stage to personal-stage environment.
`oc new-app hello-world:stage`
8. Expose route.
`oc expose svc hello-world`


## CI/CD Jenkins Monolithic pipeline with Openshift (One time setup)
### Prereqs
0. Make sure application has a containerization strategy. For this Angular app we have placed a Dockerfile
to create the container image with our application code. To repeat/automate a Jenkinsfile (One that is simple
and easy to read) make sure the Openshift resource objects are already out in the appropriate openshift namespaces
personal-dev and personal-stage by following the instructions for 'Openshift application binary build/deployment' section
above.

1. Make sure Jenkins instance is setup in openshift:
```
oc new-project jenkins
oc new-app jenkins-persistent -p MEMORY_LIMIT=2Gi # Might want jenkins-ephemeral if you are just testing this out.
```

2. Make sure there is a Jenkins agent that we can use that has the build tools to build this project. After running below command you should
see some output that contains the registry we will need to put in the Container Template with name nodejs (One of the Kubernetes Pod template
that is preconfigured with openshift jenkins-persistent template from above) in Jenkins configuration. Make sure to add this registry uri
by going to 'Jenkins > Manage Jenkins > Configure System > Scroll down to Images section on the webpage > Kubernetes Pod Template with name of
nodejs > Edit Docker image section under jnlp Container Template'.
```
oc import-image quay.io/openshift/origin-jenkins-agent-nodejs:4.7.0 --confirm --from quay.io/openshift/origin-jenkins-agent-nodejs -n jenkins
...
... image-registry.openshift-image-registry.svc:5000/jenkins/origin-jenkins-agent-nodejs:4.7.0
...
```

3. If we want to kickoff pipeline from openshift and have Jenkins know about it make sure that the BuildConfig's are synced between Jenkins and
Openshift by putting openshift application namespace/project name in 'Jenkins > Manage Jenkins > Configure System' under
OpenShift Jenkins Sync option in the Namespace field. For example, with this project I would append ' personal-dev personal-stage' to that field.

4. Jenkins service account (made when Jenkins was first created) must have edit role to those projects:

`oc policy add-role-to-user edit system:serviceaccount:jenkins:jenkins -n personal-dev`

`oc policy add-role-to-user edit system:serviceaccount:jenkins:jenkins -n personal-stage`

5. Now create a pipeline BuildConfig via oc:
```
oc new-build https://github.com/fgharo/openshift-app-project-samples.git#angular-jenkins-monolithic-cicd-pipeline \
--context-dir=hello-world  \
--strategy="pipeline" \
--name=hello-world-pipeline \
-n jenkins # Could place this in personal-dev namespace too.
```
### Repeatable Jenkins CI/CD pipeline.

Step number 5. above already started a new build. From here on out we have a repeatable/semi-automated process in the Jenkinsfile script with the push
of a button or a single command. So just run the below command or trigger the job from within Jenkins. This will build code, build container image, deploy pod/container to
personal-dev, promote to personal-stage, and finally deploy to personal-stage.
`oc start-build hello-world-pipeline`
