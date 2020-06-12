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
`oc project fharo-redhat-com-personal-dev`
1. Build actual generic BuildConfig ocp object to work with binary build.
`oc new-build  --name=hello-world --binary=true`
2. Start execution of BuildConfig object with this directory (which uses Dockerfile build container image for binary input) to produce imagestream for our app.
`oc start-build bc/hello-world --from-dir="." --wait=true --follow=true`
3. Create/Start a DeploymentConfig ocp object with the previous image stream as the input/container image.
`oc new-app hello-world:latest`
4. Expose the service created.
`oc expose svc hello-world`
