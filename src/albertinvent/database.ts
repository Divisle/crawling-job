import { AlbertinventJob, Prisma, PrismaClient } from "@prisma/client";

export class AlbertinventRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<AlbertinventJob[]> {
    return this.prisma.albertinventJob.findMany({});
  }

  async createMany(
    data: Prisma.AlbertinventJobCreateInput[]
  ): Promise<boolean> {
    try {
      await this.prisma.albertinventJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Albertinvent jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.albertinventJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Albertinvent jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.AlbertinventJobCreateInput[]) {
    const deleteJobs: Prisma.AlbertinventJobCreateInput[] = [];
    const updateJobs: Prisma.AlbertinventJobCreateInput[] = [];
    const newJobs: Prisma.AlbertinventJobCreateInput[] = [];
    const existingJobs = await this.getAll();

    data.forEach((job) => {
      const existingJob = existingJobs.find(
        (j) => j.href === job.href && j.location === job.location
      );
      if (existingJob) {
        if (existingJob.title === job.title) {
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
      const locExists = data.find(
        (j) => j.href === job.href && j.location === job.location
      );
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
