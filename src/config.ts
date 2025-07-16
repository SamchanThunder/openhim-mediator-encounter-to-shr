import * as dotenv from 'dotenv';
dotenv.config();

// Port of Mediator
export const PORT = process.env.PORT || 7060;

// OpenHIM Credentials and OpenHIM Core URL to register mediator to OpenHIM
export const OPENHIM = {
  username: getEnvironmentVariable('OPENHIM_USERNAME', 'interop@openhim.org'),
  password: getEnvironmentVariable('OPENHIM_PASSWORD', 'interop-password'),
  apiURL: getEnvironmentVariable('OPENHIM_API_URL', 'https://openhim-core:8080'),
  trustSelfSigned: true,
};

// OpenHIM Client Credentials and FHIR URL (Not used)
export const FHIR = {
  url: getEnvironmentVariable('FHIR_URL', 'http://openhim-core:5001/fhir'),
  username: getEnvironmentVariable('FHIR_USERNAME', 'interop-client'),
  password: getEnvironmentVariable('FHIR_PASSWORD', 'interop-password'),
};

// Client Registry URL which we post patient data to
export const CR = {
  url: getEnvironmentVariable('CR_URL', 'https://opencr:3000/fhir/Patient'),
};

// Client and Server Certificate file paths in docker container
export const CERTS = {
  CLIENT_CERT: getEnvironmentVariable('CLIENT_CERT', 'certificates/ansible_cert.pem'),
  CLIENT_KEY: getEnvironmentVariable('CLIENT_KEY', 'certificates/ansible_key.pem'),
  SERVER_CERT: getEnvironmentVariable('SERVER_CERT', 'certificates/server_cert.pem'),
};

function getEnvironmentVariable(env: string, def: string) {
  if (process.env.NODE_ENV === 'test') {
    return def;
  }
  
  return process.env[env] || def;
}
