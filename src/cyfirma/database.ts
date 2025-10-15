import { CyfirmaJob, Prisma, PrismaClient } from "@prisma/client";

export class CyfirmaJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<CyfirmaJob[]> {
    return this.prisma.cyfirmaJob.findMany({});
  }

  async createMany(data: Prisma.CyfirmaJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.cyfirmaJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Cyfirma jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.cyfirmaJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Cyfirma jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.CyfirmaJobCreateInput[]) {
    const deleteJobs: Prisma.CyfirmaJobCreateInput[] = [];
    const updateJobs: Prisma.CyfirmaJobCreateInput[] = [];
    const newJobs: Prisma.CyfirmaJobCreateInput[] = [];
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
