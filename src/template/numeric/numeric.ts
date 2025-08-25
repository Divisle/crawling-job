export interface NumericJobInterface {
  id?: string;
  title: string;
  company: string;
  location_type: string;
  address: string;
  department: string;
  time: string;
  href: string;
  tags: string[];
}

export interface NumericJobTagInterface {
  id?: string;
  job_title: string;
  job_href: string;
  tag: string;
}
