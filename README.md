# <ins>Encounter to SHR Mediator</ins>
### 1. Receives encounter data from OpenHIM
### 2. Obtains and changes subject reference ID to the correct patient ID from the Shared Health Record
### 3. Forwards the encounter data to the Shared Health Record
### Prerequisite: 1. openhim-mediator-client-registry (which, in short, posts patient data from OpenHIM to the Shared Health Record) 2. Data that follows the HL7 FHIR Standard 
-------------
## **How to run the mediator on Docker:**

1. In terminal, install node modules after cloning repo (one time command):
```
npm install
```

2. In terminal, build and run the mediator as a docker container (network name should be same as the Shared Health Record):
```
docker build -t encountermediator . 
docker run -d \
  --network cht-net \
  --name encountermediator \
  --rm \
  -p 7070:7070 \
  encountermediator
```

3. Install the mediator in OpenHIM Console:
```
i.   In the OpenHIM Console, go to Mediators
ii.  Click on the Encounter to SHR Mediator
iii. Click the green plus button to install the mediator.
```

4. Create a channel in OpenHIM Console:
```
i.   In the OpenHIM Console, go to Channels
ii.  Click on the channel that receives FHIR data from point of services. In my case, it is FHIR Server.
iii. Click on Routes then Add New Route
iv.  Create a route (Route Name: Encounter Mediator Route, Host: encountermediator, Port: 7070). Then click Set Route and Save Changes.
```

## **Logic**
Although Patient 1 is stored in both OpenHIM and our Shared Health Record, Patient 1's UID is different on both systems. We need to alter the subject reference on the encounter data from the UID of Patient 1 on OpenHIM to the correct UID of Patient 1 on the Shared Health Record.

To accomplish this, the encounter data before getting sent to OpenHIM should have an identifier system and value that matches exactly an identifier system and value on the patient data, which should already be stored in the Shared Health Record. In my case, the patient and encounter data has an identifier SYSTEM of its source system name and a VALUE of the patient's or subject reference's source UID.

## **Relevant Folder Structure**
```
|--src                      
|  |--config.ts              # Configuration Settings for index.ts
|  |--index.ts               # Handles mediator registration and functions (receives, formats, and posts encounter data and find correct subject reference)
|  |--mediatorConfig.ts      # Mediator Configuration Object
|--.env                      # Environment Variables used in config.ts
```
-------------------
### Demo:
https://github.com/user-attachments/assets/c92d668f-482e-46ce-8e60-730e87442107

### **Example of Encounter Data on the Shared Health Record (HAPI FHIR JPA Server):**
<img width="2559" height="1599" alt="image" src="https://github.com/user-attachments/assets/7424e0b7-7b32-4e88-8d75-8c4faaf73335" />
