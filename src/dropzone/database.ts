import { DropzoneJob, Prisma, PrismaClient } from "@prisma/client";

export class DropzoneRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<DropzoneJob[]> {
    return this.prisma.dropzoneJob.findMany({});
  }

  async createMany(data: Prisma.DropzoneJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.dropzoneJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Dropzone jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.dropzoneJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Dropzone jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.DropzoneJobCreateInput[]) {
    const deleteJobs: Prisma.DropzoneJobCreateInput[] = [];
    const updateJobs: Prisma.DropzoneJobCreateInput[] = [];
    const newJobs: Prisma.DropzoneJobCreateInput[] = [];
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
