import { SecuritiJob, Prisma, PrismaClient } from "@prisma/client";

export class SecuritiJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<SecuritiJob[]> {
    return this.prisma.securitiJob.findMany({});
  }

  async createMany(data: Prisma.SecuritiJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.securitiJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Securiti jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.securitiJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Securiti jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.SecuritiJobCreateInput[]) {
    const deleteJobs: Prisma.SecuritiJobCreateInput[] = [];
    const updateJobs: Prisma.SecuritiJobCreateInput[] = [];
    const newJobs: Prisma.SecuritiJobCreateInput[] = [];
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
