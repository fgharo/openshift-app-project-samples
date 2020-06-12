FROM nginxinc/nginx-unprivileged:1.18-alpine
COPY nginx-custom-default.conf /etc/nginx/conf.d/default.conf
COPY dist/hello-world /usr/share/nginx/html
