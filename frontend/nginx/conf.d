worker_processes  3;
pid /tmp/nginx.pid; # Changed from /var/run/nginx.pid
error_log  /var/log/nginx/error.log;
events {
  worker_connections  10240;
}

http {
  include mime.types;
  server {
    listen 8080;
    location / {
      root   /usr/share/nginx/html;
      index  index.html index.htm;
      try_files $uri $uri/ /index.html;
    }
  }
}
