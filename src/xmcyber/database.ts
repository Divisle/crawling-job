import { XMCyberJob, Prisma, PrismaClient } from "@prisma/client";

export class XMCyberJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<XMCyberJob[]> {
    return this.prisma.xMCyberJob.findMany({});
  }

  async createMany(data: Prisma.XMCyberJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.xMCyberJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating XMCyber jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.xMCyberJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting XMCyber jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.XMCyberJobCreateInput[]) {
    const deleteJobs: Prisma.XMCyberJobCreateInput[] = [];
    const updateJobs: Prisma.XMCyberJobCreateInput[] = [];
    const newJobs: Prisma.XMCyberJobCreateInput[] = [];
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
