const { registerMediator } = require('openhim-mediator-utils');
const bodyParser = require('body-parser');
const { mediatorConfig } = require('./mediatorConfig');
const { PORT, OPENHIM, CR } = require('./config');
const fs = require('fs');
const https = require('https');
const axios = require('axios');
const testJson = require('./test.json'); // Test patient json
import express, {Request, Response} from 'express';


const app = express()


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


app.get('*', (_: Request, res: Response) => {
  res.send('Mediator online')
});

// To Do: Find better way to handle certificates
var certFilePath = '/home/samchanthunder/certs/crCerts/ansible_cert.pem';
var keyFilePath = '/home/samchanthunder/certs/crCerts/ansible_key.pem';
var caCertFilePath = '/home/samchanthunder/certs/crCerts/server_cert.pem';

// Certificate handling
const httpsAgent = new https.Agent({
  cert: fs.readFileSync(certFilePath),
  key: fs.readFileSync(keyFilePath),
  ca: fs.readFileSync(caCertFilePath),
  rejectUnauthorized: false, // Only for development (--insecure)
})


// When a post request is made to /fhir/Patient in OpenHIM
app.post('/fhir/Patient', async (req: Request, res: Response) => {
  const requestBody = req.body;
  if (!requestBody) {
    console.log("Invalid Request Body");
    return res.status(400).send("Invalid Request Body");
  }else{
    // Alter the format if mixed up or invalid information

    // Identifier.system needs to be accepted by OpenCR
    if(requestBody.identifier){
      requestBody.identifier[0].system = "http://clientregistry.org/lims"; 
      // requestBody.identifier[0].system = "http://clientregistry.org/" + requestBody.identifier[0].system; 
    }else{
      console.error("The request body has no identifier array.")
      return;
    }

    // If surname is full name
    if(requestBody.name){
      var nameArray = requestBody.name[0].family.split(' ');
      if(nameArray.length == 2){
        requestBody.name[0].given[0] = nameArray[0];
        requestBody.name[0].family = nameArray[1];
      }
    }else{
      console.error("The request body has no name array.")
      return;
    }

    // If no tele number
    if (!requestBody.telecom) {
      requestBody.telecom = [
        {
          system: "phone",
          value: "0"
        }
      ];
    }

    console.log("JSON of Patient Data:", JSON.stringify(requestBody, null, 2));
  }

  try{
    const axiosResponse = await axios.post(CR.url, requestBody, { httpsAgent, headers: { 'Content-Type': 'application/json' } });
    res.status(axiosResponse.status).json(axiosResponse.data);
    console.log("OpenCR Response Data:", axiosResponse.data);

    console.log("Successs");
  }catch (error: any){
    console.error("Error in posting patient to CR");
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
  console.log("Successful registration")
});
}


export default app;