import { AntithesisJob, Prisma, PrismaClient } from "@prisma/client";
import { AshbyhqPostInterface, JobMessageData } from "@src/template";

export class AntithesisRepository {
  constructor(private prisma: PrismaClient) {}

  async getAntithesisJobs(): Promise<AntithesisJob[]> {
    return this.prisma.antithesisJob.findMany({});
  }

  async createMany(data: Prisma.AntithesisJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.antithesisJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Antithesis jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.antithesisJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Antithesis jobs:", error);
      return false;
    }
  }

  async compareData(data: AshbyhqPostInterface[]) {
    const deleteJobs: Prisma.AntithesisJobCreateInput[] = [];
    const updateJobs: Prisma.AntithesisJobCreateInput[] = [];
    const newJobs: Prisma.AntithesisJobCreateInput[] = [];
    const existingJobs = await this.getAntithesisJobs();

    data.forEach((job) => {
      const existingJob = existingJobs.find((j) => j.jobId === job.jobId);
      if (existingJob) {
        if (
          existingJob.title === job.title &&
          existingJob.location === job.location &&
          existingJob.href === job.href
        ) {
        } else {
          updateJobs.push({
            id: existingJob.id,
            jobId: job.jobId,
            title: job.title,
            location: job.location,
            href: job.href,
          });
        }
      } else {
        newJobs.push({
          jobId: job.jobId,
          title: job.title,
          location: job.location,
          href: job.href,
        });
      }
    });
    existingJobs.forEach((job) => {
      const locExists = data.find((j) => j.jobId === job.jobId);
      if (!locExists) {
        deleteJobs.push({
          id: job.id,
          jobId: job.jobId,
          title: job.title,
          location: job.location,
          href: job.href,
        });
      }
    });
    return { deleteJobs, updateJobs, newJobs };
  }
}
