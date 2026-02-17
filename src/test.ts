import { z } from "zod";

const PostJobSchema = z.object({
  title: z.string(),
  description: z.string(),
  tags: z.array(z.string()).optional(),
  budget_amount: z.string().optional(),
  deadline_seconds: z.number().optional(),
});

const CheckStatusSchema = z.object({
  job_id: z.string(),
});

const AcceptDeliverableSchema = z.object({
  job_id: z.string(),
});

function test_schemas() {
  console.log("Testing schemas...");
  
  // Valid post
  PostJobSchema.parse({ title: "Test", description: "Test desc" });
  
  // Valid accept
  AcceptDeliverableSchema.parse({ job_id: "uuid" });
  
  console.log("All schemas validated successfully.");
}

test_schemas();
