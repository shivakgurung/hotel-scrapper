const createCsvWriter = require('csv-writer').createObjectCsvWriter;

function generateCSV(data){

  
  // Define the headers for your CSV file
  const csvHeaders = [
    { id: 'name', title: 'Name' },
    { id: 'location', title: 'Location' },
    { id: 'site', title: 'Website' },
    { id: 'contact', title: 'contact' },
    { id: 'mapLocation', title: 'mapLocation' },
  ];
  
  // Create a CSV writer instance
  const csvWriter = createCsvWriter({
    path: 'output.csv', // Path to the output CSV file
    header: csvHeaders
  });
  
  // Write the data to the CSV file
  csvWriter.writeRecords(data)
    .then(() => console.log('CSV file has been written successfully.'))
    .catch((error) => console.error('Error writing CSV file:', error));
}

module.exports = generateCSV;