#!/bin/sh

# Add docker secrets to .env file
PATH_SECRETS=/run/secrets
EXISTING_ENV_FILE=.env

# If the .env file exists, stop the script and tell the user to remove it and try again
# This way if we are testing the script, we don't accidentally overwrite the .env file
if [ -f "$EXISTING_ENV_FILE" ]; then
    echo "The .env file already exists. Please remove it and try again."
    exit 1
fi

if [ -d "$PATH_SECRETS" ]; then
    for secret in $(ls $PATH_SECRETS); do
        echo "$secret='$(cat $PATH_SECRETS/$secret)'" >>.env
    done
fi

# If a command is provided, run it else keep the container running for debugging
if [ -z "$1" ]; then
    tail -f /dev/null
fi

exec "$@"
