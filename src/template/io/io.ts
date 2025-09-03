export interface IoApiPayload {
  id: string;
  title: string;
  jobId: string;
  departmentName: string;
  teamName: string;
  locationName: string;
  workplaceType: any;
  employmentType: string;
  isListed: boolean;
  publishedDate: string;
  applicationDeadline: any;
  externalLink: string;
  applyLink: string;
  locationIds: {
    primaryLocationId: string;
    secondaryLocationIds: string[];
  };
  compensationTierSummary: any;
  shouldDisplayCompensationOnJobBoard: false;
  updatedAt: string;
}
