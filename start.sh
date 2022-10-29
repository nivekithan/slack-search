#!/bin/bash

docker compose up -d 

pushd jaeger

docker compose --file jaegar-docker-compose.yml up -d

popd