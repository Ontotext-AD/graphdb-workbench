FROM cypress/base:20.11.0

COPY test-cypress/ /workbench/tests-cypress/
COPY docker-rootfs/ /workbench/docker-rootfs/
COPY dist/ /workbench/dist/
COPY Dockerfile /workbench/

WORKDIR /workbench/tests-cypress/

ENV NO_COLOR=1

RUN npm ci

CMD ["npm", "run", "paralell"]
