import { OctopusJob, Prisma, PrismaClient } from "@prisma/client";

export class OctopusJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<OctopusJob[]> {
    return this.prisma.octopusJob.findMany({});
  }

  async createMany(data: Prisma.OctopusJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.octopusJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Octopus jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.octopusJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Octopus jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.OctopusJobCreateInput[]) {
    const deleteJobs: Prisma.OctopusJobCreateInput[] = [];
    const updateJobs: Prisma.OctopusJobCreateInput[] = [];
    const newJobs: Prisma.OctopusJobCreateInput[] = [];
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
