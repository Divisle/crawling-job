import { PhoebeJob, Prisma, PrismaClient } from "@prisma/client";

export class PhoebeJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<PhoebeJob[]> {
    return this.prisma.phoebeJob.findMany({});
  }

  async createMany(data: Prisma.PhoebeJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.phoebeJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Phoebe jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.phoebeJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Phoebe jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.PhoebeJobCreateInput[]) {
    const deleteJobs: Prisma.PhoebeJobCreateInput[] = [];
    const updateJobs: Prisma.PhoebeJobCreateInput[] = [];
    const newJobs: Prisma.PhoebeJobCreateInput[] = [];
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
