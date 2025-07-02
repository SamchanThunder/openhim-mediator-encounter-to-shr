const { registerMediator } = require('openhim-mediator-utils');
const bodyParser = require('body-parser');
const { mediatorConfig } = require('./mediatorConfig');
const { PORT, OPENHIM, CR } = require('./config');
const fs = require('fs');
const os = require('os');
const https = require('https');
const axios = require('axios');
import express, {Request, Response} from 'express';


const app = express()


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


app.get('*', (_: Request, res: Response) => {
  res.send('Mediator online')
});


var certFilePath = '/home/samchanthunder/certs/crCerts/openmrs_cert.pem';
var keyFilePath = '/home/samchanthunder/certs/crCerts/openmrs_key.pem';
var caCertFilePath = '/home/samchanthunder/certs/crCerts/server_cert.pem';


const httpsAgent = new https.Agent({
  cert: fs.readFileSync(certFilePath),
  key: fs.readFileSync(keyFilePath),
  ca: fs.readFileSync(caCertFilePath),
  rejectUnauthorized: false,
})


// When a post request is made to /fhir/Patient in OpenHIM
app.post('/fhir/Patient', async (req: Request, res: Response) => {
  const requestBody = req.body;
  if (!requestBody) {
    console.log("Invalid Request Body");
    return res.status(400).send("Invalid Request Body");
  }else{
    if(requestBody.identifier){
      requestBody.identifier[0].system = "http://clientregistry.org/" + requestBody.identifier[0].system;
      console.log("Payload sent to CR:", JSON.stringify(requestBody, null, 2));
    }else{
      console.error("The request body has no identifier array.")
    }
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