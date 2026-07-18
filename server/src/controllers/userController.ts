import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { clerkClient } from "../lib/clerk";

const prisma = new PrismaClient();

// export const getUsers = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const users = await prisma.users.findMany();
//     res.json(users);
//   } catch (error) {
//     res.status(500).json({ message: "Error retrieving users" });
//   }
// };

export const getUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await prisma.users.findMany({
      select: {
        userId: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        role: true,
      },
      orderBy: {
        firstName: "asc",
      },
    });

    res.status(200).json(users);
  } catch (error) {
    console.error("Error retrieving users:", error);

    res.status(500).json({
      message: "Error retrieving users",
    });
  }
};

export const deleteUser = async (
  req: Request,
  res: Response
) => {
  try {
    const { userId } = req.params;

    await clerkClient.users.deleteUser(userId);

    return res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to delete user",
    });
  }
};

export const updateUser = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { userId } = req.params;

    const {
      firstName,
      lastName,
      username,
    } = req.body;

    // Ensure at least one field is provided
    if (!firstName && !lastName && !username) {
      return res.status(400).json({
        message: "Please provide at least one field to update.",
      });
    }

    const updatedUser = await clerkClient.users.updateUser(userId, {
      ...(firstName !== undefined && { firstName }),
      ...(lastName !== undefined && { lastName }),
      ...(username !== undefined && { username }),
    });

    return res.status(200).json({
      message: "User updated successfully.",
      user: {
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        username: updatedUser.username,
        email:
          updatedUser.emailAddresses.find(
            (email) => email.id === updatedUser.primaryEmailAddressId
          )?.emailAddress || null,
      },
    });
  } catch (error: any) {
    console.error("Error updating Clerk user:", error);

    return res.status(500).json({
      message: error?.errors?.[0]?.longMessage || "Failed to update user.",
    });
  }
};