FROM cypress/browsers:22.17.0

ENV NO_COLOR=1

WORKDIR /app

COPY e2e-tests/ .
COPY scripts/ci ./scripts/ci/
COPY dist/ ./dist/
COPY workbench.Dockerfile .
COPY .env .

RUN npm ci

