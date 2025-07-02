export const mediatorConfig = {
  urn: "urn:mediator:cr_mediator",
  version: "1.0.0",
  name: "Client Registry Patient Mediator",
  description: "Posts Patient from OpenHIM to OpenCR",
  defaultChannelConfig: [
    {
      name: "CR Patient Mediator",
      urlPattern: '^/crmediator/.*$',
      routes: [
        {
          name: "CR Patient Mediator Route",
          host: "crmediator",
          pathTransform: 's/\\/crmediator/',
          port: "7060",
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
      name: "CR Patient Mediator Endpoint",
      host: "crmediator",
      path: "/",
      port: "7060",
      primary: true,
      type: "http"
    }
  ]
};