/**
 * Data Migration Script: Recalculate Event Totals
 *
 * This script recalculates all event totals from their category data
 * to ensure data consistency after implementing the aggregation system.
 *
 * Run with: npx tsx src/scripts/migrateEventTotals.ts
 */

import { updateEventTotals } from '../server/lib/eventAggregation';
import { db } from '../server/lib/firebase-admin';

interface MigrationStats {
  totalEvents: number;
  successful: number;
  failed: number;
  errors: Array<{ userId: string; eventId: string; error: string }>;
}

export async function migrateAllEventTotals(): Promise<MigrationStats> {
  console.log('🚀 Starting event totals migration...');

  const stats: MigrationStats = {
    totalEvents: 0,
    successful: 0,
    failed: 0,
    errors: [],
  };

  try {
    // Get all workspaces
    const workspacesSnapshot = await db.collection('workspaces').get();
    console.log(`📂 Found ${workspacesSnapshot.docs.length} workspaces`);

    for (const workspaceDoc of workspacesSnapshot.docs) {
      const userId = workspaceDoc.id;
      console.log(`\n👤 Processing user: ${userId}`);

      // Get all events for this user
      const eventsSnapshot = await db
        .collection('workspaces')
        .doc(userId)
        .collection('events')
        .get();

      console.log(`   📋 Found ${eventsSnapshot.docs.length} events`);

      for (const eventDoc of eventsSnapshot.docs) {
        const eventId = eventDoc.id;
        const eventData = eventDoc.data();
        stats.totalEvents++;

        console.log(`   🎯 Migrating: ${eventData.name} (${eventId})`);

        try {
          const newTotals = await updateEventTotals(userId, eventId);
          stats.successful++;

          console.log(`      ✅ Success:`);
          console.log(`         - Budgeted: ${newTotals.totalBudgetedAmount}`);
          console.log(
            `         - Scheduled: ${newTotals.totalScheduledAmount}`,
          );
          console.log(`         - Spent: ${newTotals.totalSpentAmount}`);
          console.log(`         - Status: ${newTotals.status}`);
        } catch (error) {
          stats.failed++;
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          stats.errors.push({ userId, eventId, error: errorMessage });

          console.log(`      ❌ Failed: ${errorMessage}`);
        }
      }
    }
  } catch (error) {
    console.error('💥 Migration failed:', error);
    throw error;
  }

  return stats;
}

export async function validateEventTotalsAfterMigration(): Promise<void> {
  console.log('\n🔍 Validating event totals after migration...');

  try {
    // Get all workspaces
    const workspacesSnapshot = await db.collection('workspaces').get();

    for (const workspaceDoc of workspacesSnapshot.docs) {
      const userId = workspaceDoc.id;

      // Get all events for this user
      const eventsSnapshot = await db
        .collection('workspaces')
        .doc(userId)
        .collection('events')
        .get();

      for (const eventDoc of eventsSnapshot.docs) {
        const eventId = eventDoc.id;
        const eventData = eventDoc.data();

        // Manually calculate totals from categories
        const categoriesSnapshot = await db
          .collection('workspaces')
          .doc(userId)
          .collection('events')
          .doc(eventId)
          .collection('categories')
          .get();

        let expectedBudgeted = 0;
        let expectedScheduled = 0;
        let expectedSpent = 0;

        categoriesSnapshot.docs.forEach((categoryDoc) => {
          const categoryData = categoryDoc.data();
          expectedBudgeted += categoryData.budgetedAmount || 0;
          expectedScheduled += categoryData.scheduledAmount || 0;
          expectedSpent += categoryData.spentAmount || 0;
        });

        // Compare with event totals
        const actualBudgeted = eventData.totalBudgetedAmount || 0;
        const actualScheduled = eventData.totalScheduledAmount || 0;
        const actualSpent = eventData.totalSpentAmount || 0;

        const budgetedMatch =
          Math.abs(actualBudgeted - expectedBudgeted) < 0.01;
        const scheduledMatch =
          Math.abs(actualScheduled - expectedScheduled) < 0.01;
        const spentMatch = Math.abs(actualSpent - expectedSpent) < 0.01;

        if (!budgetedMatch || !scheduledMatch || !spentMatch) {
          console.log(`⚠️  Mismatch in event: ${eventData.name} (${eventId})`);
          console.log(
            `    Budgeted - Expected: ${expectedBudgeted}, Actual: ${actualBudgeted}`,
          );
          console.log(
            `    Scheduled - Expected: ${expectedScheduled}, Actual: ${actualScheduled}`,
          );
          console.log(
            `    Spent - Expected: ${expectedSpent}, Actual: ${actualSpent}`,
          );
        } else {
          console.log(`✅ ${eventData.name}: All totals match`);
        }
      }
    }
  } catch (error) {
    console.error('❌ Validation failed:', error);
    throw error;
  }
}

// Run the migration if this script is executed directly
if (require.main === module) {
  migrateAllEventTotals()
    .then((stats) => {
      console.log('\n📊 Migration Summary:');
      console.log(`   Total events processed: ${stats.totalEvents}`);
      console.log(`   Successful migrations: ${stats.successful}`);
      console.log(`   Failed migrations: ${stats.failed}`);

      if (stats.errors.length > 0) {
        console.log('\n❌ Errors:');
        stats.errors.forEach((error, index) => {
          console.log(
            `   ${index + 1}. User: ${error.userId}, Event: ${error.eventId}`,
          );
          console.log(`      Error: ${error.error}`);
        });
      }

      if (stats.failed === 0) {
        console.log('\n🎉 Migration completed successfully!');

        // Run validation
        return validateEventTotalsAfterMigration();
      } else {
        console.log(`\n⚠️  Migration completed with ${stats.failed} errors.`);
        process.exit(1);
      }
    })
    .then(() => {
      console.log('\n✅ Validation completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}
