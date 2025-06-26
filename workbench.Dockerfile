FROM nginx:1.17-alpine

ENV GRAPHDB_URL=http://graphdb:7200

COPY scripts/ci/start-workbench.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/start-workbench.sh

COPY scripts/ci/default.conf.template /etc/nginx/conf.d/default.conf.template
COPY dist /usr/share/nginx/html

EXPOSE 80

CMD ["start-workbench.sh"]
