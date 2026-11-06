# Ontario G1 Prep — static site (nginx). No backend, no database, no login.
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
