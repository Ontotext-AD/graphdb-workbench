FROM cypress/included:13.17.0

WORKDIR /e2e

COPY e2e-tests/package*.json /e2e/

# Install dependencies (including @cypress/code-coverage)
# If you want them local to /e2e, do `npm install --save-dev @cypress/code-coverage`
RUN npm install

# Now copy the rest of your tests or the entire e2e-tests folder
COPY e2e-tests/ /e2e

# Default entrypoint is still Cypress, but you can override in docker-compose if needed
