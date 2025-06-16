#!/bin/bash

docker pull postgres

docker run -d -p 5432:5432 \
  -e POSTGRES_PASSWORD=supersecuresecret \
  postgres \
  -c log_statement=all \
  -c log_destination=stderr \
  -c logging_collector=off