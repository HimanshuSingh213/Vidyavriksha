"use server";

import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import { userInfo } from "@/models/user.model";
import { revalidatePath } from "next/cache";

export async function getUserSettings() {
    const session = await auth();
    if (!session?.user?.id) return null;

    await dbConnect();
    const user = await userInfo.findById(session.user.id).lean();
    return JSON.parse(JSON.stringify(user));
}

export async function updateUserSettings(data) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await dbConnect();
    const updatedUser = await userInfo.findByIdAndUpdate(
        session.user.id,
        { $set: data },
        { new: true }
    );

    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard/vault");
    
    return JSON.parse(JSON.stringify(updatedUser));
}

