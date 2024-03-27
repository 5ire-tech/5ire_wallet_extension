#!/bin/bash

# This script is used to generate the firefox and chrome extension files by the name of chrome-extension.tar.gz and firefox-extension.tar.gz
# It will take one argument which would be the browser name. It can be either firefox or chrome.

# First, let's check if the user has provided the browser name or not. If they have then we need to validatee it, else if not then we build for both the browsers.

# If DEBUG is not null, then the script will print the commands that are being executed.

if [ -n "$DEBUG" ]; then
    set -x
fi

NODE_VERSION="${NODE_VERSION:-18.18.0}"

function check_for_docker() {
    if ! hash docker &> /dev/null; then
        echo "Docker not found on the system. Please install docker first.";
        exit 1
    fi
}

function _build() {
    echo "Building for $1 using the docker image node:$NODE_VERSION."

    # create our builder image specific to the browser and node version
    docker run --detach --name 5ire-$NODE_VERSION-$1-builder --rm -v $(pwd):/app -w /app node:$NODE_VERSION sleep 3600

    echo -n "Node version: " && docker exec -w /app 5ire-$NODE_VERSION-$1-builder node --version

    # build the extension
    docker exec -w /app 5ire-$NODE_VERSION-$1-builder yarn install
    docker exec -w /app 5ire-$NODE_VERSION-$1-builder yarn run build:$1

    # create the extension artifact as an archive
    cd build && tar -czf ../$1-extension.tar.gz * && cd -

    # remove the builder container
    docker kill 5ire-$NODE_VERSION-$1-builder
}

check_for_docker

case $1 in
    "chrome")
        _build chrome
        ;;
    "firefox")
        _build firefox
        ;;
    *)
        _build chrome
        _build firefox
        ;;
esac
