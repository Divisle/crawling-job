export interface LaurelApiPayload {
  jobs: [
    {
      id: string;
      title: string;
      department: string;
      team: string;
      employmentType: string;
      location: string;
      secondaryLocations: any[];
      publishedAt: string;
      isListed: boolean;
      isRemote: boolean | null;
      address: any;
      jobUrl: string;
      applyUrl: string;
      descriptionHtml: string;
      descriptionPlain: string;
    }
  ];
}
