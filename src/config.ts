import * as dotenv from 'dotenv';
dotenv.config();

// Port of Mediator
export const PORT = process.env.PORT || 7070;

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

//Shared Health Record (HAPI FHIR JPA Server in my case) 
export const SHR = {
  url: getEnvironmentVariable('SHR_URL','http://shr:8080/fhir/')
}

function getEnvironmentVariable(env: string, def: string) {
  if (process.env.NODE_ENV === 'test') {
    return def;
  }
  
  return process.env[env] || def;
}
