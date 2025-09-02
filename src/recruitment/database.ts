import { RecruitmentJob, Prisma, PrismaClient } from "@prisma/client";

export class RecruitmentRepository {
  constructor(private prisma: PrismaClient) {}

  async createMany(data: Prisma.RecruitmentJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.recruitmentJob.createMany({ data });
      return true;
    } catch (error) {
      console.error("Error creating RecruitmentJobs:", error);
      return false;
    }
  }

  async findAll(): Promise<RecruitmentJob[]> {
    return this.prisma.recruitmentJob.findMany();
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.recruitmentJob.deleteMany({
        where: { id: { in: ids } },
      });
      return true;
    } catch (error) {
      console.error("Error deleting RecruitmentJobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.RecruitmentJobCreateInput[]) {
    const oldJobData = await this.findAll();
    const newJobs: Prisma.RecruitmentJobCreateInput[] = [];
    const updateJobs: Prisma.RecruitmentJobCreateInput[] = [];
    const deleteJobs: Prisma.RecruitmentJobCreateInput[] = [];

    oldJobData.forEach((oldJob) => {
      if (data.every((newJob) => newJob.jobId !== oldJob.jobId)) {
        deleteJobs.push(oldJob);
      }
    });
    data.forEach((newJob) => {
      const existingJob = oldJobData.find(
        (oldJob) => oldJob.jobId === newJob.jobId
      );
      if (existingJob) {
        if (
          existingJob.title !== newJob.title ||
          existingJob.salary !== newJob.salary ||
          existingJob.location !== newJob.location ||
          existingJob.href !== newJob.href
        ) {
          updateJobs.push({
            id: existingJob.id,
            ...newJob,
          });
        }
      } else {
        newJobs.push(newJob);
      }
    });
    return { deleteJobs, newJobs, updateJobs };
  }
}
