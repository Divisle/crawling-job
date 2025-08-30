import { PrismaClient } from "@prisma/client";

export class TeleportJobRepository {
  constructor(private prisma: PrismaClient) {}
}
