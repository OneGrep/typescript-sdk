#!/usr/bin/env -S just --justfile

# Node.js package.json script compatibility
# https://just.systems/man/en/nodejs-packagejson-script-compatibility.html
export PATH := "./node_modules/.bin:" + env_var('PATH')

_default:
    just -l -u

install:
    pnpm install

generate:
    pnpm generate

format:
    pnpm format

lint:
    pnpm lint

build:
    pnpm build

build-types:
    pnpm turbo run build:types

build-cjs:
    pnpm turbo run build:cjs

build-esm:
    pnpm turbo run build:esm

build-sdk:
    pnpm turbo run build --filter=onegrep-sdk

bundle:
    pnpm bundle

bundle-sdk:
    pnpm turbo run bundle --filter=onegrep-sdk

dev:
    pnpm turbo run dev

start:
    pnpm turbo run start

gateway:
    pnpm turbo run start --filter=onegrep-gateway

test:
    pnpm turbo run test

test-watch:
    pnpm turbo run test:watch

inspect:
    just inspect-sse

inspect-sse:
    pnpm turbo run dev inspector:sse

inspect-stdio:
    pnpm turbo run inspector:stdio

pack:
    pnpm turbo run pack

pack-dry-run:
    pnpm turbo run pack:dryrun




