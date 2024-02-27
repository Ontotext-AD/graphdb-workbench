FROM cypress/base:20.11.0

COPY . /workbench/tests-cypress/

WORKDIR /workbench/tests-cypress/

RUN npm ci

CMD ["npm", "test"]
