export interface CredoApiPayload {
  data: {
    jobBoard: {
      teams: [
        {
          id: string;
          name: string;
          parentTeamId: string;
        }
      ];
      jobPostings: [
        {
          id: string;
          title: string;
          teamId: string;
          locationId: string;
          locationName: string;
          workplaceType: string | null;
          employmentType: string;
          secondaryLocations: any[];
          compensationTierSummary: string | null;
        }
      ];
    };
  };
}

export interface CredoJob {
  id: String;
  title: String;
  department: String;
  location: String;
  workplaceType: String;
  employmentType: String;
}
