import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Expense } from './types/Expense';
import VendorInformation from './VendorInformation';

type Vendor = Expense['vendor'];

describe('VendorInformation', () => {
  it('renders nothing when vendor has no meaningful data', () => {
    const vendor: Vendor = {
      name: '',
      address: '',
      website: '',
      email: '',
    };
    const { container } = render(<VendorInformation vendor={vendor} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when vendor is undefined', () => {
    const { container } = render(
      <VendorInformation vendor={undefined as unknown as Vendor} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('renders vendor name when present', () => {
    const vendor: Vendor = {
      name: 'Acme Catering',
      address: '',
      website: '',
      email: '',
    };
    render(<VendorInformation vendor={vendor} />);

    expect(screen.getByText('Vendor Information')).toBeInTheDocument();
    expect(screen.getByText('Acme Catering')).toBeInTheDocument();
  });

  it('renders vendor address when present', () => {
    const vendor: Vendor = {
      name: '',
      address: '123 Main St, Springfield',
      website: '',
      email: '',
    };
    render(<VendorInformation vendor={vendor} />);

    expect(screen.getByText('123 Main St, Springfield')).toBeInTheDocument();
  });

  it('renders website as a link with the protocol stripped from the label', () => {
    const vendor: Vendor = {
      name: '',
      address: '',
      website: 'https://acme-catering.example.com',
      email: '',
    };
    render(<VendorInformation vendor={vendor} />);

    const link = screen.getByRole('link', {
      name: 'acme-catering.example.com',
    });
    expect(link).toHaveAttribute('href', 'https://acme-catering.example.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders vendor email when present', () => {
    const vendor: Vendor = {
      name: '',
      address: '',
      website: '',
      email: 'hello@acme-catering.example.com',
    };
    render(<VendorInformation vendor={vendor} />);

    expect(
      screen.getByText('hello@acme-catering.example.com'),
    ).toBeInTheDocument();
  });

  it('renders all vendor fields together', () => {
    const vendor: Vendor = {
      name: 'Acme Catering',
      address: '123 Main St',
      website: 'https://acme.example.com',
      email: 'hello@acme.example.com',
    };
    render(<VendorInformation vendor={vendor} />);

    expect(screen.getByText('Acme Catering')).toBeInTheDocument();
    expect(screen.getByText('123 Main St')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'acme.example.com' }),
    ).toBeInTheDocument();
    expect(screen.getByText('hello@acme.example.com')).toBeInTheDocument();
  });
});
