import { ModalJob, Prisma, PrismaClient } from "@prisma/client";

export class ModalJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<ModalJob[]> {
    return this.prisma.modalJob.findMany({});
  }

  async createMany(data: Prisma.ModalJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.modalJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Modal jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.modalJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Modal jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.ModalJobCreateInput[]) {
    const deleteJobs: Prisma.ModalJobCreateInput[] = [];
    const updateJobs: Prisma.ModalJobCreateInput[] = [];
    const newJobs: Prisma.ModalJobCreateInput[] = [];
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
