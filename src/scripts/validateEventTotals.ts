/**
 * Validation script to check if existing events have totalScheduledAmount field
 * This can be run to identify any data migration needs
 */

import { db } from '../server/lib/firebase-admin';

export async function validateEventTotals(): Promise<void> {
  console.log('🔍 Validating event totals in database...');
  
  try {
    // Get all workspaces
    const workspacesSnapshot = await db.collection('workspaces').get();
    
    let totalEvents = 0;
    let missingScheduledAmount = 0;
    let eventsToFix: Array<{ userId: string; eventId: string; name: string }> = [];
    
    for (const workspaceDoc of workspacesSnapshot.docs) {
      const userId = workspaceDoc.id;
      
      // Get all events for this user
      const eventsSnapshot = await db
        .collection('workspaces')
        .doc(userId)
        .collection('events')
        .get();
      
      for (const eventDoc of eventsSnapshot.docs) {
        totalEvents++;
        const data = eventDoc.data();
        
        console.log(`📋 Event: ${data.name} (${eventDoc.id})`);
        console.log(`   - totalBudgetedAmount: ${data.totalBudgetedAmount ?? 'MISSING'}`);
        console.log(`   - totalScheduledAmount: ${data.totalScheduledAmount ?? 'MISSING'}`);
        console.log(`   - totalSpentAmount: ${data.totalSpentAmount ?? 'MISSING'}`);
        
        if (data.totalScheduledAmount === undefined || data.totalScheduledAmount === null) {
          missingScheduledAmount++;
          eventsToFix.push({
            userId,
            eventId: eventDoc.id,
            name: data.name,
          });
          console.log(`   ⚠️  MISSING totalScheduledAmount`);
        }
        
        console.log('');
      }
    }
    
    console.log('📊 Validation Summary:');
    console.log(`   Total events: ${totalEvents}`);
    console.log(`   Missing totalScheduledAmount: ${missingScheduledAmount}`);
    
    if (eventsToFix.length > 0) {
      console.log('\n🚨 Events that need fixing:');
      eventsToFix.forEach((event, index) => {
        console.log(`   ${index + 1}. ${event.name} (User: ${event.userId}, Event: ${event.eventId})`);
      });
      
      console.log('\n💡 These events will need to have totalScheduledAmount calculated from their categories.');
    } else {
      console.log('\n✅ All events have totalScheduledAmount field!');
    }
    
  } catch (error) {
    console.error('❌ Validation failed:', error);
    throw error;
  }
}

// Run the validation if this script is executed directly
if (require.main === module) {
  validateEventTotals()
    .then(() => {
      console.log('✅ Validation completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Validation failed:', error);
      process.exit(1);
    });
}