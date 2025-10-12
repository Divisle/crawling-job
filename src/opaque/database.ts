import { OpaqueJob, Prisma, PrismaClient } from "@prisma/client";

export class OpaqueRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<OpaqueJob[]> {
    return this.prisma.opaqueJob.findMany({});
  }

  async createMany(data: Prisma.OpaqueJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.opaqueJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Opaque jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.opaqueJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Opaque jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.OpaqueJobCreateInput[]) {
    const deleteJobs: Prisma.OpaqueJobCreateInput[] = [];
    const updateJobs: Prisma.OpaqueJobCreateInput[] = [];
    const newJobs: Prisma.OpaqueJobCreateInput[] = [];
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
