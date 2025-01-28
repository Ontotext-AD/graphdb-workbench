FROM nginx:alpine
# Copy build output from builder's www folder to the Nginx html folder
COPY /www/ /usr/share/nginx/html/

# Copy an Nginx config if you need something custom;
# otherwise the default Nginx config just serves /usr/share/nginx/html
# COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
