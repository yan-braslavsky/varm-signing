/**
 * Logger utility for consistent logging across the application
 * Supports different log levels and structured logging
 */

interface LogOptions {
  context?: string;
  data?: unknown;
  timestamp?: boolean;
}

const defaultOptions: LogOptions = {
  timestamp: true
};

class Logger {
  // Check if production environment using import.meta.env which is available in Vite
  static isProduction = import.meta.env.MODE === 'production';
  
  private static formatMessage(message: string, options: LogOptions = {}): string {
    const { context, timestamp } = { ...defaultOptions, ...options };
    
    let formattedMessage = message;
    
    if (context) {
      formattedMessage = `[${context}] ${formattedMessage}`;
    }
    
    if (timestamp) {
      const now = new Date().toISOString();
      formattedMessage = `${now} ${formattedMessage}`;
    }
    
    return formattedMessage;
  }
  
  static info(message: string, options?: LogOptions): void {
    const formattedMessage = this.formatMessage(message, options);
    console.info(formattedMessage);
    
    if (options?.data) {
      console.info(options.data);
    }
  }
  
  static warn(message: string, options?: LogOptions): void {
    const formattedMessage = this.formatMessage(message, options);
    console.warn(formattedMessage);
    
    if (options?.data) {
      console.warn(options.data);
    }
  }
  
  static error(message: string, error?: Error | unknown, options?: LogOptions): void {
    const formattedMessage = this.formatMessage(message, options);
    console.error(formattedMessage);
    
    if (error) {
      console.error(error);
    }
    
    if (options?.data) {
      console.error(options.data);
    }
  }
  
  static debug(message: string, options?: LogOptions): void {
    // Skip debug logs in production
    if (this.isProduction) return;
    
    const formattedMessage = this.formatMessage(message, options);
    console.debug(formattedMessage);
    
    if (options?.data) {
      console.debug(options.data);
    }
  }
  
  static table(data: unknown, options?: LogOptions): void {
    const { context } = { ...defaultOptions, ...options };
    
    if (context) {
      console.info(`[${context}]`);
    }
    
    if (Array.isArray(data) && data.length > 0) {
      console.table(data);
    } else {
      console.info(data);
    }
  }
  
  // Special method to deeply log object properties
  static inspectData(data: unknown, label: string = 'Data Inspection'): void {
    if (!this.isProduction) {
      console.group(label);
      
      if (Array.isArray(data)) {
        console.log(`Array of ${data.length} items`);
        data.forEach((item, index) => {
          console.group(`Item ${index}:`);
          if (typeof item === 'object' && item !== null) {
            Object.entries(item).forEach(([key, value]) => {
              console.log(`${key}: ${value} (${typeof value})`);
            });
          } else {
            console.log(item);
          }
          console.groupEnd();
        });
      } else if (typeof data === 'object' && data !== null) {
        Object.entries(data).forEach(([key, value]) => {
          console.log(`${key}: ${value} (${typeof value})`);
        });
      } else {
        console.log(data);
      }
      
      console.groupEnd();
    }
  }
}

export { Logger };
