# Use the Bind9 base image
FROM ubuntu/bind9:latest

# Install necessary packages for Bind9 and Node.js
RUN apt-get update && \
    apt-get install -y curl gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_16.x | bash - && \
    apt-get install -y nodejs && \
    npm install pm2 -g && \
    apt-get clean

# Set up working directory
WORKDIR /app

# Copy your Node.js app into the container
COPY . /app

# Install Node.js dependencies
RUN npm install

# Copy the startup script and make it executable
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Expose Bind9 ports (53 for DNS and 953 for control) and Node.js API port (5000)
EXPOSE 53/tcp 53/udp 953/tcp 5000/tcp


# Use the custom start script as the entrypoint
ENTRYPOINT ["/start.sh"]
