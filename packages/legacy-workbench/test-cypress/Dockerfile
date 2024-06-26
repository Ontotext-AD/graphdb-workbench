FROM cypress/base:20.11.0

COPY . /workbench/tests-cypress/

WORKDIR /workbench/tests-cypress/

ENV NO_COLOR=1

RUN npm ci

CMD ["npm", "test"]
