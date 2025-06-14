import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Logger } from '../utils/logger';

describe('Logger', () => {
  // Spy on console methods
  beforeEach(() => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    vi.spyOn(console, 'table').mockImplementation(() => {});
  });

  it('logs info messages', () => {
    Logger.info('Test info message');
    expect(console.info).toHaveBeenCalled();
  });

  it('logs warning messages', () => {
    Logger.warn('Test warning message');
    expect(console.warn).toHaveBeenCalled();
  });

  it('logs error messages', () => {
    Logger.error('Test error message');
    expect(console.error).toHaveBeenCalled();
  });

  it('logs debug messages', () => {
    Logger.debug('Test debug message');
    expect(console.debug).toHaveBeenCalled();
  });

  it('logs errors with error objects', () => {
    const testError = new Error('Test error object');
    Logger.error('Error occurred', testError);
    expect(console.error).toHaveBeenCalledTimes(2); // Once for message, once for error object
  });

  it('includes context in log messages', () => {
    Logger.info('Test with context', { context: 'TestComponent' });
    expect(console.info).toHaveBeenCalledWith(expect.stringContaining('[TestComponent]'));
  });

  it('logs data objects when provided', () => {
    const testData = { key: 'value' };
    Logger.info('Message with data', { data: testData });
    expect(console.info).toHaveBeenCalledTimes(2); // Once for message, once for data
  });

  it('formats table data correctly', () => {
    const tableData = [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' }
    ];
    Logger.table(tableData, { context: 'TableTest' });
    expect(console.info).toHaveBeenCalledWith('[TableTest]');
    expect(console.table).toHaveBeenCalledWith(tableData);
  });

  it('handles empty arrays in table logging', () => {
    Logger.table([]);
    expect(console.info).toHaveBeenCalled();
    expect(console.table).not.toHaveBeenCalled();
  });
});
