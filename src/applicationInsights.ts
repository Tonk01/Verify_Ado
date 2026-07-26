import { ApplicationInsights } from "@microsoft/applicationinsights-web";

const appInsights = new ApplicationInsights({
  config: {
    connectionString: "InstrumentationKey=b19309dc-56fc-4554-b57b-cff272a0f5d0;IngestionEndpoint=https://norwayeast-0.in.applicationinsights.azure.com/;LiveEndpoint=https://norwayeast.livediagnostics.monitor.azure.com/;ApplicationId=effb7716-b888-4b26-a4d7-df44bb412ae6",
  },
});

appInsights.loadAppInsights();
appInsights.trackPageView();