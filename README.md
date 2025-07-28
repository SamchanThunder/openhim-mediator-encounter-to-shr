# <ins>Client Registry Mediator</ins>
### 1. Receives patient data from OpenHIM
### 2. Standardizes it for OpenCR requirements
### 3. Securely forwards it to the client registry (OpenCR)
### 4. Obtains Client Registry Unique Identifier (CRUID) and posts the patient data to a shared health record (HAPI FHIR) with its CRUID. 
-------------
## **How to run the mediator on Docker:**

1. In terminal, install node modules after cloning repo (one time command):
```
npm install
```

2. In terminal, build and run the mediator as a docker container (network name should be same as the Client Registry):
```
docker build -t crmediator . 
docker run -d \
  --network cht-net \
  --name crmediator \
  --rm \
  -p 7060:7060 \
  crmediator
```

3. Install the mediator in OpenHIM Console:
```
i.   In the OpenHIM Console, go to Mediators
ii.  Click on the Client Registry Patient Mediator
iii. Click the green plus button to install the mediator.
```

4. Create a channel in OpenHIM Console:
```
i.   In the OpenHIM Console, go to Channels
ii.  Click on the channel that receives patient data from point of systems. In my case, it is FHIR Server.
iii. Click on Routes then Add New Route
iv.  Create a route (Route Name: CR Mediator Route, Host: crmediator, Port: 7060). Then click Set Route and Save Changes.
```
<img width="400" height="300" alt="Screenshot 2025-07-02 150412" src="https://github.com/user-attachments/assets/e68fdcf9-25e1-41de-af3d-b0134e684f7f" />

## **Standardization Logic**
We need to alter the format of the patient data for OpenCR to accept it. Read the commenting in index.ts to understand what exactly is being changed and why.
Here is the current standardization logic implemented:
```
1. Identifier System and Source Display Correction
2. Name Display Correction
3. Empty Telephone Correction
```
## **Relevant Folder Structure**
```
|--certificates              # Folder for Client and Server Certificates to access OpenCR Server (Add the correct certificates)
|--src                      
|  |--config.ts              # Configuration Settings for index.ts
|  |--index.ts               # Handles mediator registration and functions (receives, formats, and posts patient data)
|  |--mediatorConfig.ts      # Mediator Configuration Object
|  |--test.json              # Sample Patient Data for Testing Purposes
|--.env                      # Environment Variables used in config.ts
```
-------------------
### **Demo:**
https://github.com/user-attachments/assets/aa9f847e-e1fd-40f2-bb8c-c3cfbd10f50c

### **Example of Patient Data on the Shared Health Record (HAPI FHIR):**
<img width="1280" height="737" alt="Screenshot 2025-07-28 150420" src="https://github.com/user-attachments/assets/ae6d2389-5f45-4128-b189-bcbd1702a46e" />
