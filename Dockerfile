FROM node:12-alpine

ARG GITHUB_SHA
ARG GITHUB_REF

ENV KUTT_SHA=$GITHUB_SHA
ENV KUTT_REF=$GITHUB_REF
ENV DD_VERSION=$GITHUB_SHA
ENV APP_HOME="/app"

RUN apk add --update bash

RUN mkdir -p "${APP_HOME}"
WORKDIR "${APP_HOME}"

# Installing dependencies
COPY package*.json "${APP_HOME}/"
RUN npm install

# Copying build source files
COPY . .
RUN npm run build

# Give permission to run script
RUN chmod +x wait-for-it.sh

EXPOSE 3000

# Running the app
CMD [ "npm", "start" ]