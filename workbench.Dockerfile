FROM nginx:1.17-alpine

COPY ./scripts/docker-rootfs/ /

COPY ./dist /usr/share/nginx/html

RUN chmod +x /usr/local/bin/*.sh

CMD ["start-workbench.sh"]
