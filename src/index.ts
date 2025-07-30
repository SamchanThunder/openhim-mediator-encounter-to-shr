const { registerMediator } = require('openhim-mediator-utils');
const bodyParser = require('body-parser');
const { mediatorConfig } = require('./mediatorConfig');
const { PORT, OPENHIM, CR, CERTS, SHR} = require('./config');
const fs = require('fs');
const https = require('https');
const axios = require('axios');
import express, {Request, Response} from 'express';


const app = express()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('*', (_: Request, res: Response) => {
  res.send('Mediator online')
});

// Runs when a post request is made to /fhir/Encounter in OpenHIM
app.post('/fhir/Encounter', async (req: Request, res: Response) => {
  const requestBody = req.body;
  
  /* In Encounter data, we need to alter the subject reference before sending it to the shared health record (the target FHIR system).
  This is because the current subject reference refers to the patient's OpenHIM UID, but we want it 
  to refer to the patient's UID on the target system. 
  */ 
  var patientUrl;

  if (!requestBody) {
    console.log("Invalid Request Body");
    return res.status(400).send("Invalid Request Body");
  }else{
    console.log("Unchanged request body:\n" , requestBody);

    /* System and Uid in the encounter data helps us find the correct subject reference on the target system.
    This means that the system and patient source uid must be added to the encounter data even from the POS 
    (before sending it to OpenHIM)
    */
    var system = requestBody.identifier[0].system;
    var uid = requestBody.identifier[0].value;
    
    // URL to help us find the correct patient on target system
    patientUrl = SHR.url + "Patient?identifier=" + encodeURIComponent(system) + "|" + encodeURIComponent(uid); 
  }

  try{
    // GET the patient with the same system and uid
    const axiosResponseGetSHR = await axios.get(patientUrl, { headers: { 'Accept': 'application/json' } });
    const responseData = axiosResponseGetSHR.data;
    
    /* In an ideal environment, the response bundle should only include one entry which is the patient.
    This is because no POS should have the same system name. Here we get the reference patient UID on target system.
    */
    const uid = responseData.entry[0].resource.id;

    // This is where we directly alter the subject reference
    requestBody.subject.reference = "Patient/" + uid;

    // Now we post the encounter data to target system
    const encounterUrl =  SHR.url + "Encounter"

    const axiosResponseSHR = await axios.post(encounterUrl, requestBody, { headers: { 'Content-Type': 'application/json' } });
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
  console.log("Successfully registered Encounter to SHR Mediator")
});
}


export default app;