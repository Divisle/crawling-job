import { DbtlabsJob, Prisma, PrismaClient } from "@prisma/client";

export class DbtLabsJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<DbtlabsJob[]> {
    return this.prisma.dbtlabsJob.findMany();
  }

  async createMany(data: Prisma.DbtlabsJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.dbtlabsJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Dbt Labs jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.dbtlabsJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Dbt Labs jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.DbtlabsJobCreateInput[]) {
    const deleteJobs: Prisma.DbtlabsJobCreateInput[] = [];
    const updateJobs: Prisma.DbtlabsJobCreateInput[] = [];
    const newJobs: Prisma.DbtlabsJobCreateInput[] = [];
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
