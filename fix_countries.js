const fs = require('fs');

const files = [
  'src/app/(dashboard)/customers/customers-client.tsx',
  'src/app/(dashboard)/pos/pos-client.tsx'
];

const countryMap = {
  'DZ': 'Algeria', 'AO': 'Angola', 'BJ': 'Benin', 'BW': 'Botswana', 'BF': 'Burkina Faso', 'BI': 'Burundi',
  'CM': 'Cameroon', 'CV': 'Cape Verde', 'CF': 'Central African Republic', 'TD': 'Chad', 'KM': 'Comoros',
  'CG': 'Congo', 'CD': 'DR Congo', 'DJ': 'Djibouti', 'EG': 'Egypt', 'GQ': 'Equatorial Guinea',
  'ER': 'Eritrea', 'SZ': 'Eswatini', 'ET': 'Ethiopia', 'GA': 'Gabon', 'GM': 'Gambia', 'GH': 'Ghana',
  'GN': 'Guinea', 'GW': 'Guinea-Bissau', 'CI': 'Ivory Coast', 'KE': 'Kenya', 'LS': 'Lesotho', 'LR': 'Liberia',
  'LY': 'Libya', 'MG': 'Madagascar', 'MW': 'Malawi', 'ML': 'Mali', 'MR': 'Mauritania', 'MU': 'Mauritius',
  'MA': 'Morocco', 'MZ': 'Mozambique', 'NA': 'Namibia', 'NE': 'Niger', 'NG': 'Nigeria', 'RW': 'Rwanda',
  'ST': 'Sao Tome', 'SN': 'Senegal', 'SC': 'Seychelles', 'SL': 'Sierra Leone', 'SO': 'Somalia', 'ZA': 'South Africa',
  'SS': 'South Sudan', 'SD': 'Sudan', 'TZ': 'Tanzania', 'TG': 'Togo', 'TN': 'Tunisia', 'UG': 'Uganda',
  'ZM': 'Zambia', 'ZW': 'Zimbabwe'
};

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/<option value="\+(\d+)">\+\d+ \(([A-Z]{2})\)<\/option>/g, (match, code, countryCode) => {
    const countryName = countryMap[countryCode] || countryCode;
    return `<option value="+${code}">+${code} (${countryName})</option>`;
  });
  
  if (file.includes('customers-client.tsx')) {
    content = content.replace(
      /<input name="phoneInput" type="tel" className="flex-1 rounded-md border/g,
      `<input name="phoneInput" type="tel" defaultValue={editingCustomer?.phone ? editingCustomer.phone.replace(/^\\+\\d{1,4}/, '') : ''} className="flex-1 rounded-md border`
    );
  }
  
  fs.writeFileSync(file, content);
}
