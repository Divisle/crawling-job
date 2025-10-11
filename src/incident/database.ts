import { IncidentJob, Prisma, PrismaClient } from "@prisma/client";

export class IncidentRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<IncidentJob[]> {
    return this.prisma.incidentJob.findMany({});
  }

  async createMany(data: Prisma.IncidentJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.incidentJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Incident jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.incidentJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Incident jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.IncidentJobCreateInput[]) {
    const deleteJobs: Prisma.IncidentJobCreateInput[] = [];
    const updateJobs: Prisma.IncidentJobCreateInput[] = [];
    const newJobs: Prisma.IncidentJobCreateInput[] = [];
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
