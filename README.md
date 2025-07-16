# <ins>Client Registry Mediator</ins>
### Formats and Posts patient data from OpenHIM to OpenCR
-------------
## **How to run the mediator:**

1. In terminal, install node modules after cloning repo (one time command):
```
npm install
```

2. In terminal, build and run the mediator as a docker container:
```
docker build -t crmediator . 
docker run -d 
  --network cht-net 
  --name crmediator 
  --rm 
  -p 7060:7060 
  crmediator
```

3. Install the mediator in OpenHIM Console:
```
1. In the OpenHIM Console, go to Mediators
2. Click on the Client Registry Patient Mediator
3. Click the green plus button to install the mediator.
```

4. Create a channel in OpenHIM Console:
```
1. In the OpenHIM Console, go to Channels
2. Click on the channel "FHIR Server" (which is the channel that receieves patient data from point of systems)
3. Click on Routes then Add New Route
4. Create a route (Route Name: CR Mediator Route, Host: crmediator, Port: 7060). Then click Set Route and Save Changes.
```

## **Relevant Folder Structure**
```
|--certificates              # Folder for Client and Server Certificates to access OpenCR Server
|--src                      
|  |--config.ts              # Configuration Settings for index.ts
|  |--index.ts               # Handles mediator registration and functions (receives, formats, and posts patient data)
|  |--mediatorConfig.ts      # Mediator Configuration Object
|  |--test.json              # Sample Patient Data for Testing Purposes
|--.env                      # Environment Variables used in config.ts
```
