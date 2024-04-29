FROM oven/bun as base
ENV USER bun
WORKDIR /usr/src/app

# Install dependencies into a temp directory
# This will cache the dependencies and speed up future builds
FROM base as install
RUN mkdir -p /temp/dev
COPY package.json bun.lockb /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# Install dependencies for production
RUN mkdir /temp/prod
COPY package.json bun.lockb /temp/prod/
RUN cd /temp/prod && bun install --production --frozen-lockfile

# Copy node modules from the temp directory to the build directory
FROM base as prerelease
COPY --from=install /temp/dev/node_modules ./node_modules
COPY . .

# [optional] tests & build
ENV NODE_ENV=production
RUN bun test
RUN bun run build


USER bun

CMD [ "bun", "start" ]

FROM prerelease as release
COPY --chown=bun --chmod=700 entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
CMD ["bun", "start:production"]

# https://bun.sh/guides/ecosystem/docker
