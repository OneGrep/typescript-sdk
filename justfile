#!/usr/bin/env -S just --justfile

# Node.js package.json script compatibility
# https://just.systems/man/en/nodejs-packagejson-script-compatibility.html
export PATH := "./node_modules/.bin:" + env_var('PATH')

_default:
    just -l -u

# install dependencies
[group('install')]
install:
    pnpm install

# clean and fresh install dependencies
[group('install')]
reinstall:
    just clean
    just install

# generate code for all packages
[group('generate')]
generate:
    pnpm turbo run generate
    ./fix-api-client.sh # ! There's a bug in the api client generator for discriminated unions

# prettier format code for all packages
[group('format')]
format:
    pnpm format

# lint code for all packages
[group('lint')]
lint:
    pnpm turbo run lint

# fix lint errors for all packages
[group('lint')]
lint-fix:
    pnpm turbo run lint:fix

# build all packages (using turbo cache)
[group('build')]
build:
    pnpm turbo run build

# build all packages (force rebuild)
[group('build')]
rebuild:
    pnpm turbo run build --force

# build the utils package
[group('build')]
build-utils:
    pnpm turbo run build --force --filter=@repo/utils

# build the api client package
[group('build')]
build-api-client:
    pnpm turbo run build --force --filter=@repo/onegrep-api-client

# build the sdk package
[group('build')]
build-sdk:
    pnpm turbo run build --force --filter=@onegrep/sdk

# check types
[group('check')]
check-types:
    pnpm turbo run check-types

# dev
[group('dev')]
dev:
    pnpm turbo run dev --filter=@onegrep/gateway

# dev n8n
[group('dev')]
dev-n8n:
    pnpm turbo run dev --filter=@onegrep/sdk/n8n-nodes-onegrep

# blaxel serve agent
[group('blaxel')]
bl-serve:
    pnpm turbo run bl:serve --filter=@repo/blaxel-langgraph-agent

# open blaxel chat for local agent
[group('blaxel')]
bl-chat:
    pnpm turbo run bl:chat --filter=@repo/blaxel-langgraph-agent

# start the gateway
[group('gateway')]
gateway:
    pnpm turbo run start --filter=@onegrep/gateway

# test all packages
[group('test')]
test:
    pnpm turbo run test

# test the sdk package
[group('test')]
test-sdk:
    pnpm turbo run test --filter=@onegrep/sdk

# test the sdk package with blaxel toolcache
[group('test')]
test-blaxel-client:
    cd packages/onegrep-sdk && pnpm test-debug src/providers/blaxel/clientManager.test.ts --run --testNamePattern="BlaxelClientManagerTests"

[group('test')]
test-toolbox:
    cd packages/onegrep-sdk && pnpm test-debug src/toolbox.test.ts --run --testNamePattern="Toolbox Tests"

[group('test')]
test-toolcache:
    cd packages/onegrep-sdk && pnpm test-debug src/toolcache.test.ts --run --testNamePattern="UniversalToolCacheTests"

# inspect the gateway
[group('mcp-inspector')]
inspect:
    just inspect-sse

# inspect the gateway with sse
[group('mcp-inspector')]
inspect-sse:
    pnpm turbo run dev --filter=@onegrep/gateway inspector:sse

# inspect the gateway with stdio
[group('mcp-inspector')]
inspect-stdio:
    pnpm turbo run inspector:stdio

# generate licenses
[group('licenses')]
licenses:
    pnpm turbo run licenses

# pre-commit hooks
[group('check')]
pre-commit:
    .husky/pre-commit

# commit message hooks
[group('check')]
commit-msg:
    .husky/commit-msg

# package the sdk
[group('package')]
pack:
    pnpm turbo run package

# version the sdk
[group('version')]
version-sdk:
    pnpm turbo run version --filter=@onegrep/sdk

# publish the sdk
[group('publish')]
publish-sdk:
    pnpm turbo run publish:npm --filter=@onegrep/sdk

# publish the sdk (dry run)
[group('publish')]
publish-sdk-dry-run:
    pnpm turbo run publish:npm:dry-run --filter=@onegrep/sdk

# clean dist folders
[group('clean')]
clean-dist:
    pnpm turbo run clean:dist

# clean node_modules folders
[group('clean')]
clean-modules:
    pnpm turbo run clean:modules

# clean all
[group('clean')]
clean:
    pnpm turbo run clean
