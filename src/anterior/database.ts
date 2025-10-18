import { AnteriorJob, Prisma, PrismaClient } from "@prisma/client";

export class AnteriorJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<AnteriorJob[]> {
    return this.prisma.anteriorJob.findMany({});
  }

  async createMany(data: Prisma.AnteriorJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.anteriorJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Anterior jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.anteriorJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Anterior jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.AnteriorJobCreateInput[]) {
    const deleteJobs: Prisma.AnteriorJobCreateInput[] = [];
    const updateJobs: Prisma.AnteriorJobCreateInput[] = [];
    const newJobs: Prisma.AnteriorJobCreateInput[] = [];
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
