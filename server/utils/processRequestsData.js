const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Function to parse CSV data into JSON
function parseCSVToJSON(csvContent) {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',');
  
  const requests = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    
    // Skip empty lines or incomplete data
    if (values.length < 5) continue;
    
    const name = values[0]?.trim() || '';
    const requestType = values[1]?.trim() || '';
    let duration = values[2]?.trim() || '';
    const appliedDate = values[3]?.trim() || '';
    const reason = values[4]?.trim() || '';
    const result = values[5]?.trim() || '';
    
    // Format duration for single-day absences
    if (requestType === 'Absence' && duration.includes(' - ')) {
      const parts = duration.split(' - ');
      if (parts.length === 2) {
        const start = parts[0].trim();
        const end = parts[1].trim();
        
        // Check if it's the same date (handles cases like "25 July - 25 July 2025")
        if (start === end || (end.includes(start) && end.replace(start, '').trim().match(/^\d{4}$/))) {
          // Single day absence, show the end part (which has the year)
          duration = end;
        }
      }
    }
    
    const request = {
      id: uuidv4(),
      name: name,
      requestType: requestType,
      duration: duration,
      appliedDate: appliedDate,
      reason: reason,
      result: result,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Convert appliedDate to ISO format
    if (appliedDate) {
      try {
        // Parse different date formats
        let dateStr = appliedDate;
        
        // Handle "DD Month YYYY" format
        if (dateStr.includes(' ')) {
          const parts = dateStr.split(' ');
          if (parts.length === 3) {
            const day = parts[0];
            const month = parts[1];
            const year = parts[2];
            
            // Convert month name to number
            const monthNames = {
              'January': '01', 'February': '02', 'March': '03', 'April': '04',
              'May': '05', 'June': '06', 'July': '07', 'August': '08',
              'September': '09', 'October': '10', 'November': '11', 'December': '12'
            };
            
            const monthNum = monthNames[month] || '01';
            const paddedDay = day.padStart(2, '0');
            
            // Create ISO date string (YYYY-MM-DD)
            request.appliedDate = `${year}-${monthNum}-${paddedDay}`;
          }
        }
      } catch (error) {
        console.error('Error parsing date:', appliedDate, error);
        // Set to current date as fallback
        request.appliedDate = new Date().toISOString().split('T')[0];
      }
    }
    
    // Clean up and validate data
    if (name && requestType) {
      requests.push(request);
    }
  }
  
  return requests;
}

// Main processing function
function processRequestsData() {
  try {
    // Read the CSV file
    const csvFilePath = path.join(__dirname, '../../requests_dataset_csv.txt');
    const csvContent = fs.readFileSync(csvFilePath, 'utf8');
    
    // Parse CSV to JSON
    const requests = parseCSVToJSON(csvContent);
    
    // Filter out requests that already have results (processed)
    const pendingRequests = requests.filter(request => !request.result || request.result.trim() === '');
    
    console.log(`Processed ${requests.length} total requests`);
    console.log(`Found ${pendingRequests.length} pending requests`);
    
    // Save to JSON file
    const outputPath = path.join(__dirname, '../data/requests.json');
    
    // Ensure the data directory exists
    const dataDir = path.dirname(outputPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Write the processed data
    fs.writeFileSync(outputPath, JSON.stringify(pendingRequests, null, 2));
    
    console.log(`Requests data saved to: ${outputPath}`);
    
    // Also create a backup of all requests (including processed ones)
    const allRequestsPath = path.join(__dirname, '../data/all_requests.json');
    fs.writeFileSync(allRequestsPath, JSON.stringify(requests, null, 2));
    
    return pendingRequests;
    
  } catch (error) {
    console.error('Error processing requests data:', error);
    return [];
  }
}

// Run the processing if this file is executed directly
if (require.main === module) {
  processRequestsData();
}

module.exports = { processRequestsData, parseCSVToJSON }; 