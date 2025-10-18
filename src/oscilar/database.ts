import { OscilarJob, Prisma, PrismaClient } from "@prisma/client";

export class OscilarJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<OscilarJob[]> {
    return this.prisma.oscilarJob.findMany({});
  }

  async createMany(data: Prisma.OscilarJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.oscilarJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Oscilar jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.oscilarJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Oscilar jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.OscilarJobCreateInput[]) {
    const deleteJobs: Prisma.OscilarJobCreateInput[] = [];
    const updateJobs: Prisma.OscilarJobCreateInput[] = [];
    const newJobs: Prisma.OscilarJobCreateInput[] = [];
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
