import { AirtableJob, Prisma, PrismaClient } from "@prisma/client";

export class AirtableJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<AirtableJob[]> {
    return this.prisma.airtableJob.findMany({});
  }

  async createMany(data: Prisma.AirtableJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.airtableJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Airtable jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.airtableJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Airtable jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.AirtableJobCreateInput[]) {
    const deleteJobs: Prisma.AirtableJobCreateInput[] = [];
    const updateJobs: Prisma.AirtableJobCreateInput[] = [];
    const newJobs: Prisma.AirtableJobCreateInput[] = [];
    const existingJobs = await this.getAll();

    data.forEach((job) => {
      const existingJob = existingJobs.find((j) => j.href === job.href);
      if (existingJob) {
        if (
          existingJob.title === job.title &&
          existingJob.location === job.location
        ) {
        } else {
          updateJobs.push({
            id: existingJob.id,
            title: job.title,
            location: job.location,
            href: job.href,
          });
        }
      } else {
        newJobs.push({
          title: job.title,
          location: job.location,
          href: job.href,
        });
      }
    });
    existingJobs.forEach((job) => {
      const locExists = data.find((j) => j.href === job.href);
      if (!locExists) {
        deleteJobs.push({
          id: job.id,
          title: job.title,
          location: job.location,
          href: job.href,
        });
      }
    });
    return { deleteJobs, updateJobs, newJobs };
  }
}
