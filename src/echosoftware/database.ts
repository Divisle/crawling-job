import { EchosoftwareJob, Prisma, PrismaClient } from "@prisma/client";

export class EchosoftwareJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<EchosoftwareJob[]> {
    return this.prisma.echosoftwareJob.findMany({});
  }

  async createMany(
    data: Prisma.EchosoftwareJobCreateInput[]
  ): Promise<boolean> {
    try {
      await this.prisma.echosoftwareJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Echosoftware jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.echosoftwareJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Echosoftware jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.EchosoftwareJobCreateInput[]) {
    const deleteJobs: Prisma.EchosoftwareJobCreateInput[] = [];
    const updateJobs: Prisma.EchosoftwareJobCreateInput[] = [];
    const newJobs: Prisma.EchosoftwareJobCreateInput[] = [];
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
