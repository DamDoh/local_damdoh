// src/app/api/vti/route.ts

import { NextResponse } from 'next/server';
import { createVtiBatch, addVtiEvent, getVtiBatch, getVtiEventsForBatch } from '@/lib/db'; // Adjust import path as needed
import { VtiBatch, VtiEvent, PlantingEventData, HarvestEventData } from '@/lib/vti'; // Import new interfaces

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Determine if it's a batch creation or an event addition
    if (data.type === 'createBatch') {
      // Validate and create a new VTI batch
      const batchData: Omit<VtiBatch, 'id'> = data.batchData; // Basic type assertion, add more robust validation
      const newBatch = await createVtiBatch(batchData);
      return NextResponse.json({ status: 'success', data: newBatch });

    } else if (data.type === 'addEvent') {
      // Validate and add a new VTI event
      const eventData: Omit<VtiEvent, 'id'> = data.eventData; // Basic type assertion, add more robust validation

      // Add specific validation and type assertion based on eventType
      switch (eventData.eventType) {
        case 'Planting':
          const plantingData: PlantingEventData = eventData.data; // Type assertion
          // TODO: Add more robust validation for plantingData
          break;
        case 'Harvest':
          const harvestData: HarvestEventData = eventData.data; // Type assertion
          // TODO: Add more robust validation for harvestData
          break;
        // Add cases for other event types as they are defined
      }

      const newEvent = await addVtiEvent(eventData);
      return NextResponse.json({ status: 'success', data: newEvent });

    } else {
      return NextResponse.json({ status: 'error', message: 'Invalid request type' }, { status: 400 });
    }

  } catch (error) {
    console.error('Error processing VTI data:', error);
    return NextResponse.json({ status: 'error', message: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
    try {
      const { searchParams } = new URL(request.url);
      const batchId = searchParams.get('batchId');

      if (!batchId) {
        return NextResponse.json({ status: 'error', message: 'Missing batchId parameter' }, { status: 400 });
      }

      const batch = await getVtiBatch(batchId);
      const events = await getVtiEventsForBatch(batchId);

      if (!batch) {
        return NextResponse.json({ status: 'error', message: 'Batch not found' }, { status: 404 });
      }

      return NextResponse.json({ status: 'success', data: { batch, events } });

    } catch (error) {
      console.error('Error retrieving VTI data:', error);
      return NextResponse.json({ status: 'error', message: 'Internal server error' }, { status: 500 });
    }
  }