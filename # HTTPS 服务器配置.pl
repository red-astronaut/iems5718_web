# HTTPS 服务器配置
# 域名服务器配置
server {
    server_name s12.iems5718.ie.cuhk.edu.hk;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/s12.iems5718.ie.cuhk.edu.hk/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/s12.iems5718.ie.cuhk.edu.hk/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

}

# IP 访问配置
server {
    listen 80;
    server_name 172.167.9.47;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

server {
    if ($host = s12.iems5718.ie.cuhk.edu.hk) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    listen 80;
    server_name s12.iems5718.ie.cuhk.edu.hk;
    return 404; # managed by Certbot


}