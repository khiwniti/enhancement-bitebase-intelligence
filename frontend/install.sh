#!/bin/bash

# Install dependencies using npm with legacy peer deps to resolve React version conflicts
npm install --legacy-peer-deps

# Skip type checking for now due to test file issues
echo "Installation completed with legacy peer deps"
 