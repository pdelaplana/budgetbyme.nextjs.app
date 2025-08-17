#!/usr/bin/env node
import { userWorkspaceConverter } from './userWorkspaceConverter.js';

// Simple test runner for userWorkspaceConverter
console.log('🧪 Running userWorkspaceConverter tests...');

// Mock Timestamp
const mockTimestamp = (date) => ({
  toDate: () => date,
  seconds: Math.floor(date.getTime() / 1000),
  nanoseconds: (date.getTime() % 1000) * 1000000,
});

// Test 1: toFirestore conversion
try {
  const testDate = new Date('2024-01-15T10:30:00Z');
  const userWorkspace = {
    id: 'test-user',
    name: 'Test User',
    email: 'test@example.com',
    preferences: { language: 'en', currency: 'USD' },
    _createdDate: testDate,
    _createdBy: 'system',
    _updatedDate: testDate,
    _updatedBy: 'system',
  };

  const result = userWorkspaceConverter.toFirestore(userWorkspace);

  if (result.id === 'test-user' && result.document?.name === 'Test User') {
    console.log('✅ toFirestore test passed');
  } else {
    console.log('❌ toFirestore test failed');
  }
} catch (error) {
  console.log('❌ toFirestore test error:', error.message);
}

// Test 2: fromFirestore conversion
try {
  const testDate = new Date('2024-01-15T10:30:00Z');
  const firestoreDoc = {
    name: 'Test User',
    email: 'test@example.com',
    preferences: { language: 'en', currency: 'USD' },
    _createdDate: mockTimestamp(testDate),
    _createdBy: 'system',
    _updatedDate: mockTimestamp(testDate),
    _updatedBy: 'system',
  };

  const result = userWorkspaceConverter.fromFirestore(
    'test-user',
    firestoreDoc,
  );

  if (result.id === 'test-user' && result.name === 'Test User') {
    console.log('✅ fromFirestore test passed');
  } else {
    console.log('❌ fromFirestore test failed');
  }
} catch (error) {
  console.log('❌ fromFirestore test error:', error.message);
}

console.log('🎉 Test run completed!');
