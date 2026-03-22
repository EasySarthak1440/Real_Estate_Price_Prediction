# Bangalore Home Price Prediction 🏠

![](BHP_website.PNG)

This data science project series walks through a step-by-step process of how to build a real estate price prediction website. We first built a model using **sklearn** and **linear regression** using the Bangalore home prices dataset from Kaggle.com. The second step involved writing a **Python Flask server** that uses the saved model to serve HTTP requests. The third component is a website built in **HTML, CSS, and JavaScript** that allows users to enter home square ft area, bedrooms, etc., and calls the Flask server to retrieve the predicted price.

## 🚀 Live Demo
- **Frontend (Vercel):** [https://bangalore-house-price-frontend.vercel.app](https://bangalore-house-price-frontend.vercel.app)
- **Backend (Render):** [https://bangalore-house-price-backend.onrender.com/health](https://bangalore-house-price-backend.onrender.com/health)

> **Note:** The backend is hosted on Render's free tier, which means it may take 30-50 seconds to "wake up" on the first request if it hasn't been used recently.

## 🛠️ Technology & Tools
1. **Python** (3.10+)
2. **Numpy and Pandas** for data cleaning
3. **Matplotlib** for data visualization
4. **Sklearn** for model building (Linear Regression)
5. **Jupyter Notebook** for exploratory data analysis
6. **Python Flask** for the production API
7. **Gunicorn** as the WSGI HTTP Server
8. **HTML/CSS/Javascript** for the UI

## ☁️ Free Deployment (2025 Strategy)

### 1. Backend: Render
The backend is deployed on **Render** as a Web Service.
- **Root Directory:** `server`
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `gunicorn server:app`
- **Environment Variable:** `PYTHON_VERSION=3.10.0`

### 2. Frontend: Vercel
The frontend is deployed on **Vercel** as a static site.
- **Root Directory:** `client`
- **Backend URL Configuration:** The `BACKEND_URL` in `client/app.js` is updated to point to the Render service.

---

## 🏗️ Manual Deployment (Legacy AWS EC2)

1. Create EC2 instance using Amazon console, also in security group add a rule to allow HTTP incoming traffic.
2. Connect to your instance:
```bash
ssh -i "YourKey.pem" ubuntu@your-ec2-ip
```
3. Nginx setup:
   ```bash
   sudo apt-get update
   sudo apt-get install nginx
   sudo service nginx start
   ```
4. Point Nginx to load the property website by creating `/etc/nginx/sites-available/bhp.conf`:
    ```nginx
    server {
        listen 80;
        server_name bhp;
        root /home/ubuntu/BangloreHomePrices/client;
        index index.html;
        location /api/ {
             rewrite ^/api(.*) $1 break;
             proxy_pass http://127.0.0.1:5000;
        }
    }
    ```
5. Restart Nginx:
   ```bash
   sudo service nginx restart
   ```
