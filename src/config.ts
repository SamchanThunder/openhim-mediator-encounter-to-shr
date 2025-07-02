import * as dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 7060;

export const OPENHIM = {
  username: getEnvironmentVariable('OPENHIM_USERNAME', 'interop@openhim.org'),
  password: getEnvironmentVariable('OPENHIM_PASSWORD', 'interop-password'),
  apiURL: getEnvironmentVariable('OPENHIM_API_URL', 'https://openhim-core:8080'),
  trustSelfSigned: true,
};

export const FHIR = {
  url: getEnvironmentVariable('FHIR_URL', 'http://openhim-core:5001/fhir'),
  username: getEnvironmentVariable('FHIR_USERNAME', 'interop-client'),
  password: getEnvironmentVariable('FHIR_PASSWORD', 'interop-password'),
};

export const CR = {
  url: getEnvironmentVariable('CR_URL', 'https://opencr:3000/fhir/Patient'),
};


function getEnvironmentVariable(env: string, def: string) {
  if (process.env.NODE_ENV === 'test') {
    return def;
  }
  
  return process.env[env] || def;
}
