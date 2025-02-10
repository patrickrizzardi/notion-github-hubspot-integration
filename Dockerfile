# https://bun.sh/guides/ecosystem/docker
# * -------------------- Base --------------------
# * Use `target base` if you are using docker compose locally
FROM oven/bun AS base
ENV USER=bun
ENV WORKDIR=/usr/src/app
WORKDIR ${WORKDIR}

USER ${USER}
CMD [ "bun", "start" ]

# * -------------------- Install Development --------------------
FROM base AS dev-install

# Set the user to root to avoid permission issues
USER root

# Install dependencies for development
# Using a temp directory will cache the dependencies and speed up future builds
RUN mkdir -p /temp/dev
COPY --chown=${USER}:${USER} package.json bun.lockb /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile


# * -------------------- Install Prod --------------------
# Production and development installations are being separated to save time in the CI/CD pipeline during linting and testing, as production dependencies are not required for these steps
FROM base AS prod-install

# Set the user to root to avoid permission issues
USER root

# Install dependencies for production
# Using a temp directory will cache the dependencies and speed up future builds
RUN mkdir -p /temp/prod
COPY package.json bun.lockb /temp/prod/
RUN cd /temp/prod && bun install --production --frozen-lockfile

# * -------------------- Build --------------------
# Copy node modules from the temp directory to the build directory
FROM base AS build
WORKDIR ${WORKDIR}

# Set the user to root to avoid permission issues
USER root

COPY --from=dev-install /temp/dev/node_modules ./node_modules
COPY  . .

RUN bun run build

# * -------------------- Release --------------------
# * Use `target release` if you are using for production
FROM base AS release
ENV NODE_ENV=production

# Set the user to root to avoid permission issues
USER root

COPY --from=prod-install /temp/prod/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./
COPY --chmod=700 --from=build /usr/src/app/entrypoint.sh ./entrypoint.sh

# ! Entrypoint script won't run without setting the ownership first
RUN chown -R ${USER}:${USER} ${WORKDIR}

# ! Set the user back to the bun user for security
USER ${USER}

ENTRYPOINT ["./entrypoint.sh"]
CMD ["bun", "index.js"]

