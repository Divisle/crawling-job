import { FlockSafetyJob, Prisma, PrismaClient } from "@prisma/client";

export class FlockSafetyJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<FlockSafetyJob[]> {
    return this.prisma.flockSafetyJob.findMany({});
  }

  async createMany(data: Prisma.FlockSafetyJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.flockSafetyJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Flock Safety jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.flockSafetyJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Flock Safety jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.FlockSafetyJobCreateInput[]) {
    const deleteJobs: Prisma.FlockSafetyJobCreateInput[] = [];
    const updateJobs: Prisma.FlockSafetyJobCreateInput[] = [];
    const newJobs: Prisma.FlockSafetyJobCreateInput[] = [];
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
