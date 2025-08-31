export interface MaterializeApiPayLoad {
  jobs: {
    absolute_url: string;
    data_compliance: {
      type: string;
      requires_consent: boolean;
      requires_processing_consent: boolean;
      requires_retention_consent: boolean;
      retention_period: null;
      demographic_data_consent_applies: boolean;
    }[];
    internal_job_id: number;
    location: {
      name: string;
    };
    metadata: null;
    id: number;
    updated_at: string;
    requisition_id: string;
    title: string;
    company_name: string;
    first_published: string;
  }[];
}
