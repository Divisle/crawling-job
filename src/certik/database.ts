import { CertikJob, Prisma, PrismaClient } from "@prisma/client";

export class CertikJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<CertikJob[]> {
    return this.prisma.certikJob.findMany({});
  }

  async createMany(data: Prisma.CertikJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.certikJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Certik jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.certikJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Certik jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.CertikJobCreateInput[]) {
    const deleteJobs: Prisma.CertikJobCreateInput[] = [];
    const updateJobs: Prisma.CertikJobCreateInput[] = [];
    const newJobs: Prisma.CertikJobCreateInput[] = [];
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
