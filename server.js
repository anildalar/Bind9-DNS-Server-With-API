const express = require('express');
const fs = require('fs');
const { exec } = require('child_process');

const app = express();
const PORT = 5000;

// Path to your DNS zone files
const ZONE_FILE_PATH = '/etc/bind/';

// Function to reload Bind9 service
const reloadBind9 = () => {
  exec('rndc reload', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error reloading Bind9: ${error.message}`);
    }
    if (stderr) {
      console.error(`Bind9 stderr: ${stderr}`);
    }
    console.log(`Bind9 stdout: ${stdout}`);
  });
};

// API to create a DNS zone
app.get('/api/dns/zone/create', (req, res) => {
  const { domain, webserver_ip } = req.query;

  if (!domain || !webserver_ip) {
    return res.status(400).json({ error: 'Missing domain or webserver_ip' });
  }

  const zoneFile = `${ZONE_FILE_PATH}db.${domain}`;

  if (fs.existsSync(zoneFile)) {
    return res.status(400).json({ error: 'Zone already exists' });
  }

  const zoneContent = `
$TTL 604800
@ IN SOA ns1.${domain}. admin.${domain}. (
        2023101701 ; Serial
        604800 ; Refresh
        86400 ; Retry
        2419200 ; Expire
        604800 ) ; Negative Cache TTL
;
@ IN NS ns1.${domain}.
ns1 IN A ${webserver_ip}
@ IN A ${webserver_ip}
`;

  fs.writeFileSync(zoneFile, zoneContent);

  reloadBind9();

  res.status(201).json({ message: `Zone ${domain} created successfully` });
});

// API to get all DNS zones
app.get('/api/dns/zone', (req, res) => {
  const zones = fs.readdirSync(ZONE_FILE_PATH)
    .filter(file => file.startsWith('db.'))
    .map(file => file.replace('db.', ''));

  res.status(200).json({ zones });
});

// API to create a record in a zone
app.get('/api/dns/zone/:domain/create', (req, res) => {
  const { domain } = req.params;
  const { host, type, destination } = req.query;

  if (!host || !type || !destination) {
    return res.status(400).json({ error: 'Missing host, type, or destination' });
  }

  const zoneFile = `${ZONE_FILE_PATH}db.${domain}`;

  if (!fs.existsSync(zoneFile)) {
    return res.status(404).json({ error: 'Zone file not found' });
  }

  const record = `${host} IN ${type} ${destination}\n`;

  fs.appendFileSync(zoneFile, record);

  reloadBind9();

  res.status(201).json({ message: `Record ${host} ${type} ${destination} added to ${domain}` });
});

app.listen(PORT, () => {
  console.log(`DNS API server is running on port ${PORT}`);
});
