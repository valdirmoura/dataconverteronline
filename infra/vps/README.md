# Vira na VPS

O deploy serve o build estático do Vite em um container Nginx privado na rede Docker `vps_public`.
O gateway Caddy compartilhado é responsável pelo HTTPS e deve encaminhar `vira.anmaru.com` para `vira:80`.