# Building in one container, this container will get quite large
# as we need to install all the build dependencies
FROM node:18-slim as build

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /ptyhub

COPY package.json pnpm-lock.yaml .npmrc tsconfig.json .eslintrc.json ./
COPY lib ./lib

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build
# Copy everything else, except for the files in .dockerignore
COPY . .

RUN pnpm run build

# Now, in another container, we copy the built files from our build container
# into a nginx container. This container will be much smaller, as we don't
# need to install all the build dependencies. Nginx is used to serve the
# static files.
FROM docker.io/nginxinc/nginx-unprivileged:stable-bullseye-perl
COPY nginx/conf.d /etc/nginx/nginx.conf
COPY --from=build /ptyhub/build /usr/share/nginx/html

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
