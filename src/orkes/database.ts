import { OrkesJob, Prisma, PrismaClient } from "@prisma/client";

export class OrkesJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<OrkesJob[]> {
    return this.prisma.orkesJob.findMany({});
  }

  async createMany(data: Prisma.OrkesJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.orkesJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Orkes jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.orkesJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Orkes jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.OrkesJobCreateInput[]) {
    const deleteJobs: Prisma.OrkesJobCreateInput[] = [];
    const updateJobs: Prisma.OrkesJobCreateInput[] = [];
    const newJobs: Prisma.OrkesJobCreateInput[] = [];
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
