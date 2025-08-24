import { db } from './firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * Updates category spentAmount by adding the specified amount
 */
export async function addToCategorySpentAmount(
  userId: string,
  eventId: string,
  categoryId: string,
  amount: number,
  batch?: FirebaseFirestore.WriteBatch
): Promise<void> {
  const categoryRef = db
    .collection('workspaces')
    .doc(userId)
    .collection('events')
    .doc(eventId)
    .collection('categories')
    .doc(categoryId);

  const categoryDoc = await categoryRef.get();
  if (!categoryDoc.exists) {
    throw new Error('Category not found');
  }

  const categoryData = categoryDoc.data();
  const currentSpentAmount = categoryData?.spentAmount || 0;
  const newSpentAmount = currentSpentAmount + amount;

  const updateData = {
    spentAmount: newSpentAmount,
    _updatedDate: Timestamp.now(),
    _updatedBy: userId,
  };

  if (batch) {
    batch.update(categoryRef, updateData);
  } else {
    await categoryRef.update(updateData);
  }
}

/**
 * Updates category spentAmount by subtracting the specified amount
 */
export async function subtractFromCategorySpentAmount(
  userId: string,
  eventId: string,
  categoryId: string,
  amount: number,
  batch?: FirebaseFirestore.WriteBatch
): Promise<void> {
  const categoryRef = db
    .collection('workspaces')
    .doc(userId)
    .collection('events')
    .doc(eventId)
    .collection('categories')
    .doc(categoryId);

  const categoryDoc = await categoryRef.get();
  if (!categoryDoc.exists) {
    throw new Error('Category not found');
  }

  const categoryData = categoryDoc.data();
  const currentSpentAmount = categoryData?.spentAmount || 0;
  const newSpentAmount = Math.max(0, currentSpentAmount - amount);

  const updateData = {
    spentAmount: newSpentAmount,
    _updatedDate: Timestamp.now(),
    _updatedBy: userId,
  };

  if (batch) {
    batch.update(categoryRef, updateData);
  } else {
    await categoryRef.update(updateData);
  }
}

/**
 * Gets the category ID from an expense
 */
export async function getCategoryIdFromExpense(
  userId: string,
  eventId: string,
  expenseId: string
): Promise<string | null> {
  const expenseRef = db
    .collection('workspaces')
    .doc(userId)
    .collection('events')
    .doc(eventId)
    .collection('expenses')
    .doc(expenseId);

  const expenseDoc = await expenseRef.get();
  if (!expenseDoc.exists) {
    return null;
  }

  const expenseData = expenseDoc.data();
  return expenseData?.category?.id || null;
}