import { GraviteeJob, Prisma, PrismaClient } from "@prisma/client";

export class GraviteeJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<GraviteeJob[]> {
    return this.prisma.graviteeJob.findMany();
  }

  async createMany(data: Prisma.GraviteeJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.graviteeJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Gravitee jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.graviteeJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Gravitee jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.GraviteeJobCreateInput[]) {
    const deleteJobs: Prisma.GraviteeJobCreateInput[] = [];
    const updateJobs: Prisma.GraviteeJobCreateInput[] = [];
    const newJobs: Prisma.GraviteeJobCreateInput[] = [];
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
