import React from 'react';
import { render, screen } from '@testing-library/react';
import JobMonitorSection from './JobMonitorSection';
import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';

test('Header labal Job ID is rendering successfully', () => {
  render(<JobMonitorSection />);
  const element = screen.getByText(/job id/i);
  expect(element).toBeInTheDocument();
});

test('Header label Scan ID is rendering successfully', () => {
  render(<JobMonitorSection />);
  const element = screen.getByText(/scan id/i);
  expect(element).toBeInTheDocument();
});

test('Header label Progress is rendering successfully', () => {
  render(<JobMonitorSection />);
  const element = screen.getByText(/scan id/i);
  expect(element).toBeInTheDocument();
});

test('Header label Status is rendering successfully', () => {
  render(<JobMonitorSection />);
  const element = screen.getByText(/status/i);
  expect(element).toBeInTheDocument();
});

test('Header label View Job is rendering successfully', () => {
  render(<JobMonitorSection />);
  const element = screen.getByText(/view job/i);
  expect(element).toBeInTheDocument();
});

test('Header buttons are rendering successfully', () => {
  render(<JobMonitorSection />);
  const remove = screen.getByRole('button', { name: /remove all jobs/i });
  expect(remove).toBeInTheDocument();
  const stop = screen.getByRole('button', { name: /stop all jobs/i });
  expect(stop).toBeInTheDocument();
});
