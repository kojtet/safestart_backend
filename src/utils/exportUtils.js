const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const { Readable } = require('stream');

/**
 * Export data to CSV format
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Base filename for the export
 * @returns {Promise<Buffer>} CSV data as buffer
 */
const exportToCSV = async (data, filename) => {
  try {
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error('No data to export');
    }

    // Generate headers from the first object
    const headers = Object.keys(data[0]).map(key => ({
      id: key,
      title: key
    }));

    // Create a temporary file path (we'll use memory instead)
    const csvWriter = createCsvWriter({
      path: `/tmp/${filename}_${Date.now()}.csv`,
      header: headers
    });

    // Write data to CSV
    await csvWriter.writeRecords(data);

    // Read the file and return as buffer
    const fs = require('fs');
    const filePath = csvWriter.path;
    const buffer = fs.readFileSync(filePath);
    
    // Clean up temporary file
    fs.unlinkSync(filePath);

    return buffer;
  } catch (error) {
    console.error('Error in exportToCSV:', error);
    throw error;
  }
};

/**
 * Create CSV stream for large datasets
 * @param {Array} data - Array of objects to export
 * @param {Array} headers - Array of header objects with id and title
 * @returns {Readable} CSV stream
 */
const createCSVStream = (data, headers) => {
  try {
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error('No data to export');
    }

    // Create CSV header row
    const headerRow = headers.map(h => h.title).join(',') + '\n';
    
    // Create CSV data rows
    const dataRows = data.map(row => {
      return headers.map(header => {
        const value = row[header.id];
        // Escape commas and quotes in CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      }).join(',');
    }).join('\n');

    const csvContent = headerRow + dataRows;
    
    // Create readable stream
    const stream = new Readable();
    stream.push(csvContent);
    stream.push(null); // End the stream

    return stream;
  } catch (error) {
    console.error('Error in createCSVStream:', error);
    throw error;
  }
};

/**
 * Format date for export
 * @param {string|Date} date - Date to format
 * @param {string} format - Date format (default: 'YYYY-MM-DD HH:mm:ss')
 * @returns {string} Formatted date string
 */
const formatDateForExport = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  try {
    if (!date) return '';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Sanitize data for CSV export
 * @param {*} value - Value to sanitize
 * @returns {string} Sanitized value
 */
const sanitizeForCSV = (value) => {
  try {
    if (value === null || value === undefined) {
      return '';
    }
    
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    
    return String(value).trim();
  } catch (error) {
    console.error('Error sanitizing value:', error);
    return '';
  }
};

/**
 * Generate filename with timestamp
 * @param {string} baseName - Base filename
 * @param {string} extension - File extension (default: 'csv')
 * @returns {string} Generated filename
 */
const generateFilename = (baseName, extension = 'csv') => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  return `${baseName}_${timestamp}.${extension}`;
};

module.exports = {
  exportToCSV,
  createCSVStream,
  formatDateForExport,
  sanitizeForCSV,
  generateFilename
}; 