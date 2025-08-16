'use client';

import { useExampleMutation, useExampleQuery } from '@/hooks/useQueries';

export default function ReactQueryDemo() {
  const { data, isLoading, error, refetch } = useExampleQuery();
  const mutation = useExampleMutation();

  const handleMutation = () => {
    mutation.mutate({ message: 'Test mutation!' });
  };

  return (
    <div className='p-6 bg-gray-50 rounded-lg'>
      <h3 className='text-lg font-semibold mb-4'>React Query Demo</h3>

      <div className='space-y-4'>
        {/* Query Demo */}
        <div className='bg-white p-4 rounded border'>
          <h4 className='font-medium mb-2'>Query Status:</h4>
          {isLoading && <p className='text-blue-600'>Loading...</p>}
          {error && (
            <p className='text-red-600'>Error: {(error as Error).message}</p>
          )}
          {data && (
            <div>
              <p className='text-green-600'>✅ {data.message}</p>
              <p className='text-sm text-gray-500'>
                Timestamp: {data.timestamp}
              </p>
            </div>
          )}
          <button
            type='button'
            onClick={() => refetch()}
            className='mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600'
            disabled={isLoading}
          >
            Refetch
          </button>
        </div>

        {/* Mutation Demo */}
        <div className='bg-white p-4 rounded border'>
          <h4 className='font-medium mb-2'>Mutation Status:</h4>
          <button
            type='button'
            onClick={handleMutation}
            className='px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 disabled:opacity-50'
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Mutating...' : 'Test Mutation'}
          </button>

          {mutation.isError && (
            <p className='text-red-600 mt-2'>
              Mutation Error: {(mutation.error as Error)?.message}
            </p>
          )}

          {mutation.isSuccess && (
            <p className='text-green-600 mt-2'>
              ✅ Mutation Success! ID: {mutation.data?.id}
            </p>
          )}
        </div>

        {/* DevTools Info */}
        <div className='bg-yellow-50 p-4 rounded border border-yellow-200'>
          <h4 className='font-medium mb-2 text-yellow-800'>
            React Query DevTools
          </h4>
          <p className='text-sm text-yellow-700'>
            Look for the React Query logo button in the bottom-left corner of
            your screen. Click it to open the DevTools and inspect queries,
            mutations, and cache data!
          </p>
        </div>
      </div>
    </div>
  );
}
