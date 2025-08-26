export interface CredoApiPayload {
  data: {
    jobBoard: {
      team: [
        {
          id: String;
          name: String;
          parentTeamId: String;
        }
      ];
      jobs: [
        {
          id: String;
          title: String;
          teamId: String;
          locationId: String;
          locationName: String;
          workplaceType: String;
          employmentType: String;
          secondaryLocations: any[];
          compensationTierSummary: String | null;
        }
      ];
    };
  };
}
