import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/server-auth-utils';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For now, return mock messages data
    // In production, this would fetch from your database
    const mockMessages = [
      {
        id: '1',
        content: 'Welcome to DamDoh messaging!',
        senderId: 'system',
        timestamp: new Date().toISOString(),
        read: false
      }
    ];

    return NextResponse.json({ messages: mockMessages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { content, recipientId } = body;

    if (!content || !recipientId) {
      return NextResponse.json(
        { error: 'Missing required fields: content and recipientId' },
        { status: 400 }
      );
    }

    // For now, return mock response
    // In production, this would save to your database
    const newMessage = {
      id: Date.now().toString(),
      content,
      senderId: user.id,
      recipientId,
      timestamp: new Date().toISOString(),
      read: false
    };

    return NextResponse.json({ message: newMessage }, { status: 201 });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}