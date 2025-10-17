import { DuneJob, Prisma, PrismaClient } from "@prisma/client";

export class DuneJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<DuneJob[]> {
    return this.prisma.duneJob.findMany({});
  }

  async createMany(data: Prisma.DuneJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.duneJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Dune jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.duneJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Dune jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.DuneJobCreateInput[]) {
    const deleteJobs: Prisma.DuneJobCreateInput[] = [];
    const updateJobs: Prisma.DuneJobCreateInput[] = [];
    const newJobs: Prisma.DuneJobCreateInput[] = [];
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
