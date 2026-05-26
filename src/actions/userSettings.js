"use server";

import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import { User } from "@/models/user.model";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";

export async function getUserSettings() {
    const session = await auth();
    if (!session?.user?.id) return null;
    const userId = session.user.id;

    const getCachedSettings = unstable_cache(
        async () => {
            await dbConnect();
            const user = await User.findById(userId).lean();
            return JSON.parse(JSON.stringify(user));
        },
        [`settings-${userId}`], // Unique Cache Key
        { tags: [`settings-${userId}`], revalidate: 86400 } // Invalidation Tag
    );

    return await getCachedSettings();
}

export async function updateUserSettings(data) {
    try {
        const session = await auth();
        if (!session?.user?.id) throw new Error("Unauthorized");
        const userId = session?.user?.id;

        await dbConnect();

        const {
            name,
            program,
            targetCGPA,
            universityScale,
            currentSem,
            currentCGPA
        } = data;

        const updateFields = {};

        if (name !== undefined) updateFields.name = name;
        if (program !== undefined) updateFields.program = program;
        if (targetCGPA !== undefined) updateFields.targetCGPA = targetCGPA;
        if (universityScale !== undefined) updateFields.universityScale = universityScale;
        if (currentSem !== undefined) updateFields.currentSem = currentSem;
        if (currentCGPA !== undefined) updateFields.currentCGPA = currentCGPA;

        const updatedUser = await User.findByIdAndUpdate(
            session.user.id,
            { $set: updateFields },
            { new: true }
        );

        if (!updatedUser) {
            throw new Error("User not found in the database.");
        }

        revalidateTag(`settings-${userId}`);
        revalidateTag(`vault-${userId}`);

        revalidatePath("/dashboard/settings");
        revalidatePath("/dashboard/vault");

        return {
            success: true,
            message: "Settings updated successfully"
        };
    } catch (err) {
        console.error("Error updating user settings:", err);
 
        return {
            success: false,
            message: err.message || "Failed to update settings"
        };
    }

}

