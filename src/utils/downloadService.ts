import { Service } from '../types/service';

export const downloadServiceDetails = (service: Service) => {
  const content = `
SERVICE DETAILS: ${service.name}
----------------------------------------
ID: ${service.id}
Status: ${service.status}
Environment: ${service.environment}
Category: ${service.category}
Type: ${service.serviceTypeName || 'General'}
Team: ${service.team}

INFRASTRUCTURE
----------------------------------------
URL: ${service.url || 'N/A'}
IP Address: ${service.ip_address || 'N/A'}
Port: ${service.port || 'N/A'}
Documentation: ${service.documentation || 'N/A'}
Dashboard: ${service.dashboard || 'N/A'}

DATABASE & ACCESS
----------------------------------------
DB Connection: ${service.db_connection || 'N/A'}
PDB Name: ${service.pdb_name || 'N/A'}
DB Username: ${service.db_username || 'N/A'}
DB Password: ${service.db_password || 'N/A'}
Service Username: ${service.service_username || 'N/A'}
Service Password: ${service.service_password || 'N/A'}

NOTES
----------------------------------------
${service.notes || 'No notes available.'}

Last Updated: ${new Date(service.lastUpdated).toLocaleString()}
  `.trim();

  const blob = new Blob([content], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${service.name.replace(/\s+/g, '_')}_details.txt`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};
