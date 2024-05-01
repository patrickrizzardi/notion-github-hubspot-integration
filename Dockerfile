# https://bun.sh/guides/ecosystem/docker

FROM oven/bun as base
ENV USER bun
ENV WORKDIR /usr/src/app
WORKDIR ${WORKDIR}

# Use `target base` if you are using docker compose locally
USER ${USER}
CMD [ "bun", "start" ]

# -------------------- Install --------------------
# Install dependencies into a temp directory
# This will cache the dependencies and speed up future builds
FROM base as install
RUN mkdir -p /temp/dev
COPY --chown=${USER}:${USER} package.json bun.lockb /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# Install dependencies for production into a temp directory
# This will cache the dependencies and speed up future builds
RUN mkdir /temp/prod
COPY --chown=${USER}:${USER} package.json bun.lockb /temp/prod/
RUN cd /temp/prod && bun install --production --frozen-lockfile

# -------------------- Build --------------------
# Copy node modules from the temp directory to the build directory
FROM base as build
WORKDIR ${WORKDIR}

COPY --chown=${USER}:${USER} --from=install /temp/dev/node_modules ./node_modules
COPY --chown=${USER}:${USER} . .

RUN bun run build

# -------------------- Release --------------------
FROM build as release
ENV NODE_ENV=production

COPY --from=install /temp/prod/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./
COPY --chmod=700 --from=prerelease /usr/src/app/entrypoint.sh ./entrypoint.sh

# Entrypoint script won't run without setting the ownership first
USER root
RUN chown -R ${USER}:${USER} ${WORKDIR}

# Set the user back to the bun user for security
USER ${USER}

ENTRYPOINT ["./entrypoint.sh"]
CMD ["bun", "start:production"]

