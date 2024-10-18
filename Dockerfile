# Use the Bind9 base image
FROM ubuntu/bind9:latest

# Install necessary packages for Bind9 and Node.js
RUN apt-get update && \
    apt-get install -y curl gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    npm install pm2 -g && \
    apt-get clean

# Set up working directory
WORKDIR /app
# Copy your Node.js (Next.js) app into the container
COPY ./webapp/* .

# Copy your Node.js app into the container
COPY start.sh .

# Install Node.js dependencies
RUN npm install
# Build the Next.js application
#RUN npm run build

# Copy the startup script and make it executable
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Copy configuration files
COPY ./bind/named.conf /etc/bind/named.conf
COPY ./bind/named.conf.local /etc/bind/named.conf.local
COPY ./bind/named.conf.options /etc/bind/named.conf.options
# Ensure proper permissions
RUN chown -R bind:bind /etc/bind

# Generate rndc.key and configure BIND
RUN rndc-confgen -a && echo 'include "/etc/bind/rndc.key";' >> /etc/bind/named.conf

# Expose Bind9 ports (53 for DNS and 953 for control) and Node.js API port (5000)
EXPOSE 53/tcp 53/udp 953/tcp 5000/tcp 3000


# Use the custom start script as the entrypoint
ENTRYPOINT ["/start.sh"]
