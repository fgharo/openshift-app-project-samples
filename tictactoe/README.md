This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `npm run build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify



## Containerizing application to run with either docker, podman, or manually on openshift.

### Prereqs
Add Dockerfile to create container image on builder image nginxinc/nginx-unprivileged:1.18-alpine. Titled Dockerfile in this folder.
Install dependencies `npm install`
Create spa content to serve on nginx server. Should have code in build/ via command `npm run build`


### Podman Local Container Engine
Build actual container image. `podman build -t tictactoe .`
Run actual container and forward requests to 8080 which is port nginx is listening on. `podman run --name tictactoe -p 8080:8080 -d tictactoe`

### Openshift application binary build/deployment
Be in project you want to create app resources in. `oc project dev`
Build actual generic BuildConfig ocp object to work with binary build. `oc new-build --name=tictactoe --binary=true`
Start execution of BuildConfig object with this directory (which uses Dockerfile build container image for binary input) to produce imagestream for our app. `oc start-build bc/tictactoe --from-dir="." --wait=true --follow=true`
Create/Start a DeploymentConfig ocp object with the previous image stream as the input/container image. `oc new-app tictactoe:latest`
Expose the service created. `oc expose svc/tictactoe --port=8080` note this didn't work (note this might not work depending on oc client version)
Promote tag to stage environment `oc tag dev/tictactoe:latest stage/tictactoe:stage`.
Create application in stage environment `oc new-app tictactoe:stage -n stage`.
Expose the service created. `oc expose svc/tictactoe --port=8080 -n stage`.







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
OpenShift Jenkins Sync option in the Namespace field. For example, with this project I would append ' dev stage' to that field.

4. Jenkins service account (made when Jenkins was first created) must have edit role to those projects:

`oc policy add-role-to-user edit system:serviceaccount:jenkins:jenkins -n dev`

`oc policy add-role-to-user edit system:serviceaccount:jenkins:jenkins -n stage`

5. Now create a pipeline BuildConfig via oc:
```
oc new-build https://github.com/fgharo/openshift-app-project-samples.git#react-jenkins-monolithic-cicd-pipeline \
--context-dir=tictactoe  \
--strategy="pipeline" \
--name=tictactoe-pipeline \
-n dev
```
### Repeatable Jenkins CI/CD pipeline.

Step number 5. above already started a new build. From here on out we have a repeatable/semi-automated process in the Jenkinsfile script with the push
of a button or a single command. So just run the below command or trigger the job from within Jenkins. This will build code, build container image, deploy pod/container to
personal-dev, promote to personal-stage, and finally deploy to personal-stage.
`oc start-build tictactoe-pipeline`
