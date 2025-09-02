#!/bin/bash
# Install uv if not available
if ! command -v uv &> /dev/null
then
    echo "uv could not be found, installing..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
    # Add the default install location to the script's PATH
    export PATH="/home/user/.local/bin:$PATH"
fi

# Create a virtual environment
uv venv

# Activate the virtual environment and install dependencies
source .venv/bin/activate
uv pip install -r requirements.txt
