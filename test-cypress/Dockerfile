FROM cypress/base:12

COPY . /workbench/tests-cypress/

WORKDIR /workbench/tests-cypress/

RUN npm ci

CMD ["npm", "test"]
