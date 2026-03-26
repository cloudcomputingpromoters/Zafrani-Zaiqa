# Zafrani Zaiqa — Website Deployment Guide

Static website for **zafranizaiqa.com** — a home-based Hyderabadi catering and delivery business.

---

## File Structure

```
/
├── index.html          ← Homepage
├── menu.html           ← Full menu & pricing
├── catering.html       ← Catering packages & interactive calculator
├── about.html          ← About the business
├── contact.html        ← Order form & FAQ
├── css/
│   └── styles.css      ← Custom styles
├── js/
│   └── main.js         ← JavaScript (nav, animations, forms)
└── README.md
```

All pages load **Tailwind CSS** and **Google Fonts** via CDN — no build step required.

---

## Before You Deploy — Personalise First

Search for these placeholders and replace with real values:

| Placeholder | Replace with |
|---|---|
| `216-260-5930` | Your actual phone number |
| `info@zafranizaiqa.com` | Your actual email |
| `<!-- address placeholder -->` | Your city / service area |

---

## Deploying to Amazon Linux Nginx

### 1. Launch & Connect to Your EC2 Instance

```bash
ssh -i your-key.pem ec2-user@YOUR_EC2_PUBLIC_IP
```

> Use Amazon Linux 2 or Amazon Linux 2023 AMI (t2.micro or t3.micro is fine for a static site).

---

### 2. Install Nginx

```bash
# Amazon Linux 2
sudo yum update -y
sudo yum install nginx -y

# Amazon Linux 2023
sudo dnf update -y
sudo dnf install nginx -y
```

Start and enable Nginx:

```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

### 3. Upload Your Website Files

From your local machine, use `scp` to copy the files:

```bash
scp -i your-key.pem -r "path/to/Zafrani Zaiqa/" ec2-user@YOUR_EC2_IP:/tmp/zafranizaiqa
```

Then on the server, move them to the web root:

```bash
sudo mkdir -p /var/www/zafranizaiqa
sudo cp -r /tmp/zafranizaiqa/* /var/www/zafranizaiqa/
sudo chown -R nginx:nginx /var/www/zafranizaiqa
sudo chmod -R 755 /var/www/zafranizaiqa
```

---

### 4. Configure Nginx Virtual Host

Create a new site configuration:

```bash
sudo nano /etc/nginx/conf.d/zafranizaiqa.conf
```

Paste the following (replace `YOUR_DOMAIN_OR_IP`):

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name zafranizaiqa.com www.zafranizaiqa.com YOUR_EC2_IP;

    root /var/www/zafranizaiqa;
    index index.html;

    # Serve pages cleanly (no .html extension required)
    location / {
        try_files $uri $uri.html $uri/ =404;
    }

    # Cache static assets
    location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Gzip compression
    gzip on;
    gzip_types text/html text/css application/javascript text/javascript image/svg+xml;
    gzip_min_length 1024;

    # Custom 404
    error_page 404 /index.html;
}
```

Test and reload:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

### 5. Open Firewall Ports (EC2 Security Group)

In the AWS Console → EC2 → Security Groups, add inbound rules:

| Type | Protocol | Port | Source |
|---|---|---|---|
| HTTP | TCP | 80 | 0.0.0.0/0 |
| HTTPS | TCP | 443 | 0.0.0.0/0 |
| SSH | TCP | 22 | Your IP |

---

### 6. Point Your Domain (Route 53 or External DNS)

Create an **A record** pointing `zafranizaiqa.com` → Your EC2 Elastic IP.

> **Tip:** Allocate an **Elastic IP** in EC2 so your IP doesn't change on reboot.

---

### 7. Enable HTTPS with Let's Encrypt (Certbot)

```bash
# Amazon Linux 2
sudo amazon-linux-extras install epel -y
sudo yum install certbot python2-certbot-nginx -y

# Amazon Linux 2023
sudo dnf install certbot python3-certbot-nginx -y
```

Run Certbot:

```bash
sudo certbot --nginx -d zafranizaiqa.com -d www.zafranizaiqa.com
```

Follow the prompts. Certbot will automatically update your Nginx config for HTTPS and set up auto-renewal.

Test auto-renewal:

```bash
sudo certbot renew --dry-run
```

---

### 8. Verify the Site

Visit `http://YOUR_EC2_IP` or `https://zafranizaiqa.com` once DNS propagates (can take up to 48 hours).

---

## Quick Update Workflow

To update site content after initial deployment:

```bash
# From local machine
scp -i your-key.pem index.html ec2-user@YOUR_EC2_IP:/var/www/zafranizaiqa/

# Or upload multiple files
scp -i your-key.pem -r css/ js/ ec2-user@YOUR_EC2_IP:/var/www/zafranizaiqa/

# Fix ownership if needed
ssh -i your-key.pem ec2-user@YOUR_EC2_IP "sudo chown -R nginx:nginx /var/www/zafranizaiqa"
```

---

## Troubleshooting

| Issue | Fix |
|---|---|
| 403 Forbidden | `sudo chmod -R 755 /var/www/zafranizaiqa` |
| 502 Bad Gateway | Nginx not running: `sudo systemctl restart nginx` |
| CSS/JS not loading | Check file paths are relative, verify `css/` and `js/` folders were uploaded |
| Site shows default Nginx page | Make sure `conf.d/zafranizaiqa.conf` has correct `root` path and `sudo systemctl reload nginx` was run |
| SSL certificate error | Re-run `sudo certbot --nginx` with correct domain name |

---

## Optional: Deploy with rsync (Faster Updates)

```bash
rsync -avz --delete \
  -e "ssh -i your-key.pem" \
  "path/to/Zafrani Zaiqa/" \
  ec2-user@YOUR_EC2_IP:/var/www/zafranizaiqa/
```

---

*Zafrani Zaiqa — Authentic Hyderabadi Cuisine · zafranizaiqa.com*
