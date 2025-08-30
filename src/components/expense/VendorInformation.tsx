'use client';

import React from 'react';
import {
  BuildingOfficeIcon,
  GlobeAltIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import type { Expense } from '@/types/Expense';

interface VendorInformationProps {
  vendor: Expense['vendor'];
}

const VendorInformation = React.memo<VendorInformationProps>(({ vendor }) => {
  // Only render if vendor has meaningful data
  if (!vendor || (!vendor.name && !vendor.address && !vendor.website && !vendor.email)) {
    return null;
  }

  return (
    <div className='card'>
      <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
        <BuildingOfficeIcon className='h-5 w-5 mr-2' />
        Vendor Information
      </h3>

      <div className='space-y-4'>
        {vendor.name && (
          <div>
            <div className='text-sm font-medium text-gray-500 uppercase tracking-wide'>
              Vendor Name
            </div>
            <p className='mt-1 text-base font-semibold text-gray-900'>
              {vendor.name}
            </p>
          </div>
        )}

        {vendor.address && (
          <div>
            <div className='text-sm font-medium text-gray-500 uppercase tracking-wide'>
              Address
            </div>
            <div className='mt-1 flex items-start'>
              <MapPinIcon className='h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0' />
              <p className='text-base text-gray-900'>
                {vendor.address}
              </p>
            </div>
          </div>
        )}

        {vendor.website && (
          <div>
            <div className='text-sm font-medium text-gray-500 uppercase tracking-wide'>
              Website
            </div>
            <div className='mt-1 flex items-center'>
              <GlobeAltIcon className='h-4 w-4 text-gray-400 mr-2 flex-shrink-0' />
              <a
                href={vendor.website}
                target='_blank'
                rel='noopener noreferrer'
                className='text-base text-primary-600 hover:text-primary-700 hover:underline transition-colors duration-200'
              >
                {vendor.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          </div>
        )}

        {vendor.email && (
          <div>
            <div className='text-sm font-medium text-gray-500 uppercase tracking-wide'>
              Email
            </div>
            <div className='mt-1 flex items-center'>
              <span className='text-base text-gray-900'>
                {vendor.email}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

VendorInformation.displayName = 'VendorInformation';

export default VendorInformation;