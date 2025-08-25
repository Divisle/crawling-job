import { NumericJob, Prisma, PrismaClient } from "@prisma/client";
import { NumericJobInterface, NumericJobTagInterface } from "../template";
import { time } from "console";
export class NumericJobRepository {
  constructor(private prisma: PrismaClient) {}

  async createMany(data: NumericJobInterface[]) {
    try {
      const jobData: Prisma.NumericJobCreateInput[] = [];
      const tagData: NumericJobTagInterface[] = [];
      data.forEach((job) => {
        jobData.push({
          title: job.title,
          company: job.company,
          address: job.address,
          location_type: job.location_type,
          department: job.department,
          href: job.href,
          time: job.time,
        });
        job.tags?.forEach((tag) => {
          tagData.push({
            job_title: job.title,
            job_href: job.href,
            tag,
          });
        });
      });
      await this.prisma.numericJob.createMany({ data: jobData });
      // Select all jobId, tag from numericJob join with data of tag on job_title and job_href fields from a VALUES clause
      if (tagData.length > 0) {
        const query = `
          SELECT j.id as "jobId", t.tag
          FROM "NumericJob" j
          JOIN (VALUES 
            ${tagData
              .map(
                (tag) => `('${tag.job_title}', '${tag.job_href}', '${tag.tag}')`
              )
              .join(", ")}
        ) AS t (job_title, job_href, tag)
        ON j.title = t.job_title AND j.href = t.job_href
      `;
        const existingTags: { jobId: string; tag: string }[] =
          await this.prisma.$queryRawUnsafe(query);
        await this.prisma.numericJobTag.createMany({
          data: existingTags,
        });
      }
      return true;
    } catch (error) {
      console.error("Error creating numeric jobs:", error);
      return false;
    }
  }

  async findMany(): Promise<
    Prisma.NumericJobGetPayload<{ include: { tags: true } }>[]
  > {
    try {
      return await this.prisma.numericJob.findMany({
        include: {
          tags: true,
        },
      });
    } catch (error) {
      console.error("Error finding numeric jobs:", error);
      return [];
    }
  }

  async updateMany(data: Prisma.NumericJobUpdateInput[]): Promise<boolean> {
    try {
      await this.prisma.numericJob.updateMany({ data });
      return true;
    } catch (error) {
      console.error("Error updating numeric jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.numericJob.deleteMany({ where: { id: { in: ids } } });
      return true;
    } catch (error) {
      console.error("Error deleting numeric jobs:", error);
      return false;
    }
  }

  async compareData(datas: NumericJobInterface[]) {
    const newJobs: NumericJobInterface[] = [];
    const updateJobs: NumericJobInterface[] = [];
    const deleteJobs: NumericJobInterface[] = [];
    const existingJobs = await this.findMany();
    existingJobs.forEach((job) => {
      if (
        !datas.some(
          (newJob) => newJob.title !== job.title && newJob.href !== job.href
        )
      ) {
        deleteJobs.push({
          title: job.title,
          company: job.company,
          address: job.address,
          location_type: job.location_type,
          department: job.department,
          href: job.href,
          time: job.time,
          tags: job.tags.map((tag) => tag.tag),
        });
      }
    });
    datas.forEach((newJob) => {
      const existingJob = existingJobs.find(
        (job) => job.title === newJob.title && job.href === newJob.href
      );
      if (!existingJob) {
        newJobs.push(newJob);
      } else if (
        existingJob.title !== newJob.title ||
        existingJob.location_type !== newJob.location_type ||
        existingJob.address !== newJob.address ||
        existingJob.department !== newJob.department ||
        existingJob.time !== newJob.time ||
        existingJob.company !== newJob.company
      ) {
        updateJobs.push({ ...newJob });
      } else {
        existingJob?.tags.sort((a, b) => a.tag.localeCompare(b.tag));
        newJob.tags!.sort((a, b) => a.localeCompare(b));
        if (JSON.stringify(existingJob?.tags) !== JSON.stringify(newJob.tags)) {
          updateJobs.push({ ...newJob });
        }
      }
    });
    return { newJobs, updateJobs, deleteJobs };
  }
}
