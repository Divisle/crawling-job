import { ArmadaJob, Prisma, PrismaClient } from "@prisma/client";

export class ArmadaJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<ArmadaJob[]> {
    return this.prisma.armadaJob.findMany({});
  }

  async createMany(data: Prisma.ArmadaJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.armadaJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Armada jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.armadaJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Armada jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.ArmadaJobCreateInput[]) {
    const deleteJobs: Prisma.ArmadaJobCreateInput[] = [];
    const updateJobs: Prisma.ArmadaJobCreateInput[] = [];
    const newJobs: Prisma.ArmadaJobCreateInput[] = [];
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
