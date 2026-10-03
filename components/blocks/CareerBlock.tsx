"use client";

import JobListings from './marketing/careers/job-listings';
import FeaturedJobSlider from './marketing/careers/featured-job-slider';
import CompanyBenefits from './marketing/careers/company-benefits';
import WorkplaceCulture from './marketing/careers/workplace-culture';
import JobDetails from './marketing/careers/job-details';

export interface CareerBlockProps {
  variant?: 'job-listings' | 'featured-slider' | 'benefits' | 'culture' | 'job-details';
  title?: string;
  subtitle?: string;
  jobs?: Array<{
    id: number;
    title: string;
    department: string;
    location: string;
    type: string;
    description: string;
    requirements: string[];
  }>;
  benefits?: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
}

export function CareerBlock({
  variant = 'job-listings',
  title = "Join Our Team",
  subtitle = "Build your career with a company that values innovation and growth",
  jobs,
  benefits
}: CareerBlockProps) {
  switch (variant) {
    case 'featured-slider':
      return <FeaturedJobSlider />;
    case 'benefits':
      return <CompanyBenefits />;
    case 'culture':
      return <WorkplaceCulture />;
    case 'job-details':
      return <JobDetails />;
    case 'job-listings':
    default:
      return <JobListings />;
  }
}