import { NextResponse } from "next/server";

import {
  createSupabaseAdminClient,
} from "@/lib/supabase/admin";

import {
  PAYMENT_PRODUCTS,
} from "@/lib/payment-products";

import {
  AI_SPEAKING_PLANS,
  isAiSpeakingPlanId,
} from "@/lib/ai-speaking-plans";


export const runtime = "nodejs";
export const dynamic = "force-dynamic";


const MAX_FILE_SIZE =
  5 * 1024 * 1024;


function unauthorized() {
  return NextResponse.json(
    {
      error: "Unauthorized",
    },
    {
      status: 401,
      headers: {
        "Cache-Control":
          "no-store",
      },
    },
  );
}


function getProduct(
  productCode: string,
) {
  if (
    isAiSpeakingPlanId(
      productCode,
    ) &&
    productCode !==
      "ai-lifetime"
  ) {
    const plan =
      AI_SPEAKING_PLANS[
        productCode
      ];

    return {
      code:
        plan.id,

      title:
        plan.title,

      amountMmk:
        plan.priceMmk,
    };
  }


  const hsk =
    PAYMENT_PRODUCTS.find(
      (product) =>
        product.code ===
          productCode &&
        product.active,
    );


  if (!hsk) {
    return null;
  }


  return {
    code:
      hsk.code,

    title:
      hsk.title,

    amountMmk:
      hsk.priceMmk,
  };
}


function getExtension(
  file: File,
): string {
  const name =
    file.name.toLowerCase();


  if (
    name.endsWith(".png")
  ) {
    return "png";
  }

  if (
    name.endsWith(".webp")
  ) {
    return "webp";
  }

  if (
    name.endsWith(".pdf")
  ) {
    return "pdf";
  }

  if (
    name.endsWith(".jpeg") ||
    name.endsWith(".jpg")
  ) {
    return "jpg";
  }


  if (
    file.type ===
    "image/png"
  ) {
    return "png";
  }

  if (
    file.type ===
    "image/webp"
  ) {
    return "webp";
  }

  if (
    file.type ===
    "application/pdf"
  ) {
    return "pdf";
  }


  return "jpg";
}


export async function POST(
  request: Request,
) {
  try {
    /*
     * 1. Authenticate mobile user
     */
    const authorization =
      request.headers.get(
        "authorization",
      );


    if (
      !authorization?.startsWith(
        "Bearer ",
      )
    ) {
      return unauthorized();
    }


    const accessToken =
      authorization
        .slice(7)
        .trim();


    if (!accessToken) {
      return unauthorized();
    }


    const admin =
      createSupabaseAdminClient();


    const {
      data: {
        user,
      },
      error:
        userError,
    } =
      await admin.auth.getUser(
        accessToken,
      );


    if (
      userError ||
      !user
    ) {
      return unauthorized();
    }


    /*
     * 2. Read multipart form
     */
    const formData =
      await request.formData();


    const productCode =
      String(
        formData.get(
          "product_code",
        ) ?? "",
      )
        .trim()
        .toLowerCase();


    const paymentMethod =
      String(
        formData.get(
          "payment_method",
        ) ?? "",
      )
        .trim()
        .toLowerCase();


    const slip =
      formData.get(
        "slip",
      );


    if (
      !productCode
    ) {
      return NextResponse.json(
        {
          error:
            "Product is required.",
        },
        {
          status: 400,
        },
      );
    }


    const product =
      getProduct(
        productCode,
      );


    if (!product) {
      return NextResponse.json(
        {
          error:
            "Invalid payment product.",
        },
        {
          status: 400,
        },
      );
    }


    if (
      paymentMethod !==
        "kpay" &&
      paymentMethod !==
        "qr_pay"
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid payment method.",
        },
        {
          status: 400,
        },
      );
    }


    if (
      !(slip instanceof File)
    ) {
      return NextResponse.json(
        {
          error:
            "Payment slip is required.",
        },
        {
          status: 400,
        },
      );
    }


    if (
      slip.size <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Payment slip is empty.",
        },
        {
          status: 400,
        },
      );
    }


    if (
      slip.size >
      MAX_FILE_SIZE
    ) {
      return NextResponse.json(
        {
          error:
            "Payment slip must be 5 MB or smaller.",
        },
        {
          status: 400,
        },
      );
    }


    /*
     * 3. Prevent multiple pending
     * payment requests.
     */
    const {
      data:
        pendingPayment,
      error:
        pendingError,
    } =
      await admin
        .from(
          "payment_requests",
        )
        .select("id")
        .eq(
          "user_id",
          user.id,
        )
        .eq(
          "status",
          "pending",
        )
        .limit(1)
        .maybeSingle();


    if (pendingError) {
      throw pendingError;
    }


    if (pendingPayment) {
      return NextResponse.json(
        {
          error:
            "You already have a pending payment request. Please wait for Admin review.",
        },
        {
          status: 409,
        },
      );
    }


    /*
     * 4. Upload payment slip
     */
    const extension =
      getExtension(
        slip,
      );


    const fileName =
      `${Date.now()}-${crypto.randomUUID()}.${extension}`;


    const storagePath =
      `${user.id}/${fileName}`;


    const bytes =
      await slip.arrayBuffer();


    const {
      error:
        uploadError,
    } =
      await admin.storage
        .from(
          "payment-slips",
        )
        .upload(
          storagePath,
          bytes,
          {
            contentType:
              slip.type ||
              "application/octet-stream",

            upsert:
              false,
          },
        );


    if (uploadError) {
      throw new Error(
        `Payment slip upload failed: ${uploadError.message}`,
      );
    }


    /*
     * 5. Create payment request
     */
    const {
      data:
        payment,
      error:
        paymentError,
    } =
      await admin
        .from(
          "payment_requests",
        )
        .insert({
          user_id:
            user.id,

          product_code:
            product.code,

          product_title:
            product.title,

          amount_mmk:
            product.amountMmk,

          payment_method:
            paymentMethod,

          status:
            "pending",

          slip_path:
            storagePath,

          admin_note:
            null,
        })
        .select(
          `
            id,
            product_code,
            product_title,
            amount_mmk,
            payment_method,
            status,
            created_at
          `,
        )
        .single();


    if (
      paymentError
    ) {
      /*
       * DB insert fail ရင်
       * orphan slip ကို remove.
       */
      await admin.storage
        .from(
          "payment-slips",
        )
        .remove([
          storagePath,
        ]);


      throw new Error(
        `Payment request failed: ${paymentError.message}`,
      );
    }


    return NextResponse.json(
      {
        success:
          true,

        payment,
      },
      {
        status:
          201,

        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      },
    );
  } catch (
    error
  ) {
    console.error(
      "Mobile payment submit error:",
      error,
    );


    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to submit payment.",
      },
      {
        status:
          500,
      },
    );
  }
}