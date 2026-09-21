import { prisma } from "./prisma";
import { createPrintifyCustomOrder, printifyConfigured } from "./elevate-printify";

type Recipient = {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  country: string;
  region?: string;
  address1: string;
  address2?: string;
  city: string;
  zip: string;
};

export async function markElevatePrintPaid(
  jobId: string,
  checkoutSessionId: string,
  paymentIntentId?: string | null
) {
  const job = await prisma.elevatePrintJob.findUnique({ where: { id: jobId } });
  if (!job) return null;
  if (["SUBMITTED", "IN_PRODUCTION", "SHIPPED", "FULFILLED"].includes(job.status)) return job;

  return prisma.elevatePrintJob.update({
    where: { id: job.id },
    data: {
      status: "PAID_READY_TO_SUBMIT",
      paymentRef: paymentIntentId || checkoutSessionId,
    },
  });
}

export async function submitElevatePrintJob(jobId: string, userId: string) {
  const job = await prisma.elevatePrintJob.findFirst({ where: { id: jobId, userId } });
  if (!job) throw new Error("PRINT_JOB_NOT_FOUND");
  if (job.providerOrderId) return job;
  if (job.status !== "PAID_READY_TO_SUBMIT") throw new Error("PRINT_JOB_NOT_PAID");
  if (process.env.ELEVATE_FULFILLMENT_LIVE !== "true") throw new Error("LIVE_FULFILLMENT_DISABLED");
  if (!printifyConfigured()) throw new Error("PRINT_PROVIDER_NOT_CONNECTED");
  if (!job.blueprintId || !job.printProviderId || !job.providerVariantId || !job.artworkUrl || !job.recipient) {
    throw new Error("PRINT_JOB_INCOMPLETE");
  }

  const claimed = await prisma.elevatePrintJob.updateMany({
    where: { id: job.id, userId, status: "PAID_READY_TO_SUBMIT", providerOrderId: null },
    data: { status: "SUBMITTING" },
  });
  if (claimed.count !== 1) {
    const latest = await prisma.elevatePrintJob.findUnique({ where: { id: job.id } });
    if (latest?.providerOrderId) return latest;
    throw new Error("PRINT_JOB_BUSY");
  }

  try {
    const order = await createPrintifyCustomOrder({
      externalId: "elevate-print-" + job.id,
      blueprintId: job.blueprintId,
      printProviderId: job.printProviderId,
      variantId: job.providerVariantId,
      quantity: job.quantity,
      shippingMethod: job.shippingMethod,
      artworkUrl: job.artworkUrl,
      address: job.recipient as unknown as Recipient,
    });

    return prisma.elevatePrintJob.update({
      where: { id: job.id },
      data: {
        status: "SUBMITTED",
        providerOrderId: order.id || null,
      },
    });
  } catch (error) {
    await prisma.elevatePrintJob.updateMany({
      where: { id: job.id, status: "SUBMITTING" },
      data: { status: "PAID_READY_TO_SUBMIT" },
    });
    throw error;
  }
}
