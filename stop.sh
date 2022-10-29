#!/bin/bash

docker compose down 

pushd jaeger

docker compose --file jaegar-docker-compose.yml down

popd