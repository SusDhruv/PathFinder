import { HistoryTable } from "@/configs/schema";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/configs/db";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
    try {
        const user = await currentUser();
        
        if (!user?.primaryEmailAddress?.emailAddress) {
            return NextResponse.json(
                { error: "User not authenticated" },
                { status: 401 }
            );
        }

        const { content, recordId,aiAgentType } = await req.json();
        
        if (!recordId) {
            return NextResponse.json(
                { error: "recordId is required" },
                { status: 400 }
            );
        }

        const result = await db.insert(HistoryTable).values({
            recordId: recordId,
            content: content,
            userEmail: user.primaryEmailAddress.emailAddress,
            aiAgentType:aiAgentType
        });

        return NextResponse.json(
            { success: true, data: result },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error in history API:', error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function PUT(req: Request) {
    try {
        const user = await currentUser();
        
        if (!user?.primaryEmailAddress?.emailAddress) {
            return NextResponse.json(
                { error: "User not authenticated" },
                { status: 401 }
            );
        }

        const { content, recordId } = await req.json();
        
        console.log('PUT /api/history - Received data:', { content, recordId });
        
        if (!recordId) {
            return NextResponse.json(
                { error: "recordId is required" },
                { status: 400 }
            );
        }

        console.log('Updating history for recordId:', recordId);
        console.log('Content to update:', content);

        const result = await db.update(HistoryTable)
            .set({
                content: content,
            })
            .where(eq(HistoryTable.recordId, recordId));

        console.log('Update result:', result);

        return NextResponse.json(
            { success: true, data: result },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error in history API PUT:', error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function GET(req: Request) {
    try {
        const user = await currentUser();
        
        if (!user?.primaryEmailAddress?.emailAddress) {
            return NextResponse.json(
                { error: "User not authenticated" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const recordId = searchParams.get('recordId');
        
        if (recordId) {
            // If recordId is provided, return that specific record
            const result = await db.select().from(HistoryTable).where(eq(HistoryTable.recordId, recordId));
            if (result.length === 0) {
                return NextResponse.json(
                    { error: "No history found for this recordId" },
                    { status: 404 }
                );
            }
            return NextResponse.json(
                { success: true, data: result[0] },
                { status: 200 }
            );
        } else {
            // If no recordId, return all history for the user
            const userEmail = user.primaryEmailAddress.emailAddress;
            const result = await db.select().from(HistoryTable).where(eq(HistoryTable.userEmail, userEmail));
            return NextResponse.json(
                { success: true, data: result },
                { status: 200 }
            );
        }
    } catch (error) {
        console.error('Error in history API GET:', error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}