FROM cypress/base:16.18.1

COPY . /workbench/tests-cypress/

WORKDIR /workbench/tests-cypress/

RUN npm ci

CMD ["npm", "test"]
