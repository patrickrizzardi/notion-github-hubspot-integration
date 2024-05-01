FROM oven/bun as base
ENV USER bun
ENV WORKDIR /usr/src/app
WORKDIR ${WORKDIR}

# Install dependencies into a temp directory
# This will cache the dependencies and speed up future builds
FROM base as install
RUN mkdir -p /temp/dev
COPY --chown=${USER}:${USER} package.json bun.lockb /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# Install dependencies for production
RUN mkdir /temp/prod
COPY --chown=${USER}:${USER} package.json bun.lockb /temp/prod/
RUN cd /temp/prod && bun install --production --frozen-lockfile

# Copy node modules from the temp directory to the build directory
FROM base as prerelease
WORKDIR ${WORKDIR}

COPY --chown=${USER}:${USER} --from=install /temp/dev/node_modules ./node_modules
COPY --chown=${USER}:${USER} . .

RUN bun run build

USER ${USER}
CMD [ "bun", "start" ]

FROM prerelease as release
ENV NODE_ENV=production

COPY --chown=${USER}:${USER} --from=install /temp/prod/node_modules ./node_modules
COPY --chown=${USER}:${USER} --from=prerelease /usr/src/app/dist ./
COPY --chown=${USER}:${USER} --chmod=700 --from=prerelease /usr/src/app/entrypoint.sh ./entrypoint.sh

USER ${USER}

ENTRYPOINT ["./entrypoint.sh"]
CMD ["bun", "start:production"]

# https://bun.sh/guides/ecosystem/docker
