export interface TeleportApiPayload {
  pageProps: {
    data: {
      pageTitle: string;
      slug: string;
      redirects: any[];
      modules: {
        __typename: "ComponentPageModulesJobList";
        title: "Job postings";
        jobs: {
          id: string;
          text: string;
          hostedUrl: string;
          createdAt: number;
          commitment: string;
          department: string;
          location: string;
          team: string;
          allLocations: string[];
        }[];
      }[];
      metaData: any;
    };
    pageType: string;
  };
  __N_SSG: true;
}
