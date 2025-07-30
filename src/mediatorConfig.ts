export const mediatorConfig = {
  urn: "urn:mediator:encounter_mediator",
  version: "1.0.0",
  name: "Encounter to SHR Mediator",
  description: "Posts Encounter to SHR with CRUID",
  defaultChannelConfig: [
    {
      name: "Encounter to SHR Mediator",
      urlPattern: '^/encountermediator/.*$',
      routes: [
        {
          name: "Encounter to SHR Mediator Route",
          host: "encountermediator",
          pathTransform: 's/\\/encountermediator/',
          port: "7070",
          primary: true,
          type: "http"
        }
      ],
      allow: ["interop"],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      type: "http"
    }
  ],
  endpoints: [
    {
      name: "Encounter to SHR Mediator Endpoint",
      host: "encountermediator",
      path: "/",
      port: "7070",
      primary: true,
      type: "http"
    }
  ]
};