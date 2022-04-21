ARG NODE_VERSION=16
#
# Build Stage
#
FROM node:${NODE_VERSION} As build
ARG CI_JOB_TOKEN
ENV NODE_VERSION=$NODE_VERSION
ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV
ENV CI_JOB_TOKEN=$CI_JOB_TOKEN

WORKDIR /var/www

COPY ./ ./

RUN echo $NODE_ENV
RUN echo $CI_JOB_TOKEN

RUN sed "s/GITLAB_TOKEN/${CI_JOB_TOKEN}/g" .npmrc.default > .npmrc &&\
    cat .npmrc &&\
    npm install -g @nestjs/cli &&\
    npm ci &&\
    npm run build &&\
    rm .npmrc*

#
# Release Stage
#
FROM node:14-alpine as release
ARG CI_JOB_TOKEN
ARG PASS_SERVICE_PORT=3000
ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV}
ENV ENVIRONMENT_SCOPE=""
ENV NEW_RELIC_APP_NAME=""
ENV CI_JOB_TOKEN=${CI_JOB_TOKEN}

WORKDIR /var/www
COPY --from=0 /var/www/node_modules ./node_modules
COPY --from=0 /var/www/dist ./
COPY --from=0 /var/www/package.json ./
COPY --from=0 /var/www/tsconfig.build.json ./
COPY --from=0 /var/www/tsconfig.json ./
COPY --from=0 /var/www/newrelic.js ./
COPY docker/start.sh /start.sh
RUN chmod +X /start.sh
EXPOSE $PASS_SERVICE_PORT

ENTRYPOINT ["sh", "/start.sh"]