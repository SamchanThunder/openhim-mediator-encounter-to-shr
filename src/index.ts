const { registerMediator } = require('openhim-mediator-utils');
const bodyParser = require('body-parser');
const { mediatorConfig } = require('./mediatorConfig');
const { PORT, OPENHIM, CR, CERTS, SHR} = require('./config');
const fs = require('fs');
const https = require('https');
const axios = require('axios');
const testJson = require('./test.json'); // Sample Patient Data for Testing Purposes
import express, {Request, Response} from 'express';


const app = express()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('*', (_: Request, res: Response) => {
  res.send('Mediator online')
});

// Client and Server Certficates' File Path for OpenCR
var clientCertPath = CERTS.CLIENT_CERT;
var clientKeyPath = CERTS.CLIENT_KEY;
var serverCertPath = CERTS.SERVER_CERT;

// Certificate handling for OpenCR
const httpsAgent = new https.Agent({
  cert: fs.readFileSync(clientCertPath),
  key: fs.readFileSync(clientKeyPath),
  ca: fs.readFileSync(serverCertPath),
  rejectUnauthorized: false, // Only for development (--insecure)
})

// Runs when a post request is made to /fhir/Patient in OpenHIM
app.post('/fhir/Patient', async (req: Request, res: Response) => {
  const requestBody = req.body;

  if (!requestBody) {
    console.log("Invalid Request Body");
    return res.status(400).send("Invalid Request Body");
  }else{
    console.log("Unchanged request body:\n" , requestBody);

    /* 1. IDENTIFIER SYSTEM AND PATIENT SOURCE LOGIC:
    OpenCR only accepts patient data with specific identifier systems. We need to change the identifier system if its invalid.
    To change what identifier system OpenCR accepts, you must edit the config_.json file in OpenCR. Within the correct config_.json, 
    add new systems you want to be valid into the systems.CRBaseURI.internalid.uri array.
    
    Note: This mediator expects the patient data from OpenHIM or the POS to have a requestBody.identifier, where 
    requestBody.identifier[0].system is the name of the original POS and requestBody.identifier[0].value to be
    the patient's UID from its POS.
    */
    if(requestBody.identifier){
      if(requestBody.identifier[0].system){
        
        /* For example, patient data from CHT has an identifier[0].system = "cht". However, my client registry only accepts
        identifier systems with http://clientregistry.org/, such as http://clientregistry.org/cht
        */
        var systemName = requestBody.identifier[0].system;
        requestBody.identifier.push({
          use: "official",
          system: "http://clientregistry.org/" + systemName,
          value: requestBody.identifier[0].value
        });

        /* In OpenCR, the source of the patient data is fetched from meta.tag[i], where system is: "http://openclientregistry.org/fhir/clientid"
        We want to add this to display the source of the patient data on OpenCR. 
        
        Note: OpenCR only accepts patient data with specific sources.
        To add more valid sources to OpenCR, add to the clients array in the config_.json file in OpenCR. The code attribute should match 
        a clients.id in clients.
        */
        const tagObject = { 
          system: "http://openclientregistry.org/fhir/clientid",
          code: systemName,
          display: systemName
        };
        
        if (!requestBody.meta) {
          requestBody.meta = { tag: [tagObject] };
        } else if (!requestBody.meta.tag) {
          requestBody.meta.tag = [tagObject];
        } else {
          requestBody.meta.tag.push(tagObject);
        }
      }else{
         requestBody.identifier[0].system = "http://clientregistry.org/unknown"; 
      }
    }else{
      console.error("The request body has no identifier array.")
      return;
    }

    /* 2. NAME LOGIC:
    Makes changes to name in patient data, if needed, to correct how it is dispalyed in OpenCR
    */
    if(requestBody.name){
      // Community Tool Healthkit formats the name in its patient data incorrectly to OpenHIM. This corrects it.
      var nameArray = requestBody.name[0].family.split(' ');
      if(nameArray.length == 2){
        requestBody.name[0].given[0] = nameArray[0];
        requestBody.name[0].family = nameArray[1];
      }

      // If name[0].use is absent, creates a name[0].use attribute as "official"
      if(!requestBody.name[0].use){
        requestBody.name[0].use = "official";
      }
    }else{
      console.error("The request body has no name array.")
      return;
    }

    /* 3. TELEPHONE LOGIC
    If patient data has no telephone number, assigns a default number "0" to it.
    */
    if (!requestBody.telecom) {
      requestBody.telecom = [
        {
          system: "phone",
          value: "0"
        }
      ];
    }
    console.log("Changed request body:\n" , requestBody);
  }

  // After formatting patient data correctly, post to OpenCR
  try{
    const axiosResponseCR = await axios.post(CR.url, requestBody, { httpsAgent, headers: { 'Content-Type': 'application/json' } });
    console.log("Successsfully Posted Patient Data to OpenCR");

    // Get the CRUID (Client Registry Unique ID)
    const CRUID = axiosResponseCR.headers.locationcruid;
    
    // Reformat patient data to add its CRUID
    requestBody.identifier[requestBody.identifier.length - 1].value = CRUID;
    requestBody.identifier.push({
      use: "official",
      system: "cruid",
      value: CRUID.substring(8)
    });
    console.log("SHR Request Body: \n" , requestBody);

    // Post Patient Data with CRUID to a Shared Health Record (Which is a HAPI FHIR Server in my case)
    const axiosResponseSHR = await axios.post(SHR.url, requestBody, { headers: { 'Content-Type': 'application/json' } });
    res.status(axiosResponseSHR.status).json(axiosResponseSHR.data);

    console.log("Succesfully posted to SHR");
  }catch (error: any){
    console.error("Error in posting patient", error);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Headers:", error.response.headers);
      console.error("Data:", error.response.data);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Axios error config:", error.config);
    }
  }
})

// Register mediator to OpenHIM
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
 
  registerMediator(OPENHIM, mediatorConfig, (err: any) => {
  if (err) {
    throw new Error(`Failed to register mediator. Check your Config. ${err}`)
  }
  console.log("Successfully registered CR Mediator")
});
}


export default app;