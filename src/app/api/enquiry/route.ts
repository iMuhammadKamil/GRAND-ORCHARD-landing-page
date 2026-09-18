import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const enquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name.").max(120),
  phone: z
    .string()
    .trim()
    .min(7, "Please enter a valid phone number.")
    .max(30)
    .regex(/^[+0-9()\-\s]+$/, "Phone number can only contain digits and + ( ) - characters."),
  email: z.string().trim().email("Please enter a valid email address.").max(160),
  interest: z.enum(["Apartment", "Commercial", "Kiosk", "General Enquiry"]),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = enquirySchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      return NextResponse.json(
        { ok: false, error: "Please review the highlighted fields.", fieldErrors },
        { status: 400 }
      );
    }

    const { name, phone, email, interest, message } = parsed.data;

    await db.enquiry.create({
      data: {
        name,
        phone,
        email,
        interest,
        message: message && message.length > 0 ? message : null,
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Thank you. Our team will contact you regarding Grand Orchard.",
    });
  } catch (err) {
    console.error("[api/enquiry] failed:", err);
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please try again shortly." },
      { status: 500 }
    );
  }
}
