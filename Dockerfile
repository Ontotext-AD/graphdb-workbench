FROM nginx:1.17-alpine

ENV GRAPHDB_URL=http://graphdb:7200

COPY docker-rootfs/ /

COPY src/ /usr/share/nginx/html

RUN chmod +x /usr/local/bin/*.sh

EXPOSE 80

CMD ["start-workbench.sh"]
